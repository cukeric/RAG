import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'

// Create Groq client with the provided API key
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

// Robust JSON Parser that handles common LLM errors (like unescaped newlines)
function cleanJsonString(jsonString: string): string {
  let inString = false
  let escaped = false
  let result = ''

  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString[i]

    if (inString) {
      if (char === '\\') {
        escaped = !escaped
        result += char
      } else if (char === '"' && !escaped) {
        inString = false
        result += char
      } else if (char === '\n') {
        // Replace unescaped newline inside string with \n
        result += '\\n'
      } else if (char === '\r') {
        // Ignore carriage returns inside strings
      } else if (char === '\t') {
        // Replace unescaped tabs inside string with \t
        result += '\\t'
      } else {
        escaped = false
        result += char
      }
    } else {
      if (char === '"') {
        inString = true
      }
      result += char
    }
  }
  return result
}

// Validation Helper
function parseJSON<T>(text: string, schema: z.ZodSchema<T>, fallback: T): T {
  try {
    // Extract JSON from potential code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    let jsonString = jsonMatch ? jsonMatch[0] : text

    // Attempt to repair common JSON errors
    try {
      JSON.parse(jsonString)
    } catch (e) {
      // If standard parse fails, try our robust cleaner
      console.log('[DEBUG] JSON parse failed, attempting repair...')
      jsonString = cleanJsonString(jsonString)
    }

    const parsed = JSON.parse(jsonString)
    return schema.parse(parsed)
  } catch (error) {
    console.error('JSON Parsing Error:', error)
    console.log('[DEBUG] Failed text:', text)
    return fallback
  }
}

// Self-RAG Grading Schemas (used for validation only now)
export const RetrievalGradeSchema = z.object({
  retrieval_score: z.number().min(0).max(1),
  relevance_reasoning: z.string(),
  is_relevant: z.boolean(),
})

export const ResponseGradeSchema = z.object({
  response_relevance: z.number().min(0).max(1),
  faithfulness: z.number().min(0).max(1),
  hallucination_risk: z.enum(['low', 'medium', 'high', 'critical']),
  hallucination_reasoning: z.string(),
  confidence_score: z.number().min(0).max(1),
})

export const RiskIndicatorSchema = z.object({
  level: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(1),
})

export const StructuredOutputSchema = z.object({
  summary: z.string(),
  answer: z.string(),
  risk_indicators: z.array(RiskIndicatorSchema),
  confidence_score: z.number().min(0).max(1),
  source_reasoning: z.array(z.string()),
})

// Self-RAG Grader: Assess retrieval quality
export async function gradeRetrievalQuality(
  query: string,
  retrievedChunks: Array<{ content: string; metadata?: string }>
): Promise<{
  retrieval_score: number
  relevance_reasoning: string
  is_relevant: boolean
}> {
  const context = retrievedChunks
    .map((chunk, i) => `[Chunk ${i + 1}]: ${chunk.content}`)
    .join('\n\n')

  try {
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are a retrieval quality grader. Assess how well the retrieved context matches the query.
Output valid JSON only. format:
{
  "retrieval_score": number (0-1),
  "relevance_reasoning": string,
  "is_relevant": boolean
}`,
      prompt: `Query: ${query}\n\nRetrieved Context:\n${context}`,
    })

    return parseJSON(text, RetrievalGradeSchema, {
      retrieval_score: 0.5,
      relevance_reasoning: 'Grading failed - using default score',
      is_relevant: false,
    })
  } catch (error) {
    console.error('Retrieval grading error:', error)
    return {
      retrieval_score: 0.5,
      relevance_reasoning: 'Grading failed - using default score',
      is_relevant: false,
    }
  }
}

// Self-RAG Grader: Assess response quality and detect hallucinations
export async function gradeResponseQuality(
  query: string,
  context: string,
  response: string
): Promise<{
  response_relevance: number
  faithfulness: number
  hallucination_risk: 'low' | 'medium' | 'high' | 'critical'
  hallucination_reasoning: string
  confidence_score: number
}> {
  try {
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are a response quality grader. Output valid JSON only. Format:
{
  "response_relevance": number (0-1),
  "faithfulness": number (0-1),
  "hallucination_risk": "low" | "medium" | "high" | "critical",
  "hallucination_reasoning": string,
  "confidence_score": number (0-1)
}`,
      prompt: `Query: ${query}\n\nContext:\n${context}\n\nResponse:\n${response}`,
    })

    return parseJSON(text, ResponseGradeSchema, {
      response_relevance: 0.5,
      faithfulness: 0.5,
      hallucination_risk: 'medium',
      hallucination_reasoning: 'Grading failed',
      confidence_score: 0.5,
    })
  } catch (error) {
    console.error('Response grading error:', error)
    return {
      response_relevance: 0.5,
      faithfulness: 0.5,
      hallucination_risk: 'medium',
      hallucination_reasoning: 'Grading failed',
      confidence_score: 0.5,
    }
  }
}

// Generate structured output with risk indicators
export async function generateStructuredOutput(
  query: string,
  context: string,
  retrievedChunks: Array<{ content: string; documentName?: string }>
): Promise<{
  summary: string
  answer: string
  risk_indicators: Array<{
    level: 'low' | 'medium' | 'high' | 'critical'
    category: string
    description: string
    confidence: number
  }>
  confidence_score: number
  source_reasoning: string[]
}> {
  const contextWithSources = retrievedChunks
    .map(
      (chunk, i) => `[Source ${i + 1} - ${chunk.documentName || 'Unknown'}]: ${chunk.content}`
    )
    .join('\n\n')

  try {
    const { text } = await generateText({
      model: groq('llama-3.1-8b-instant'),
      system: `You are an expert decision support analyst. Generate a structured analysis.
Output valid JSON only. Format:
{
  "summary": "Concise executive summary",
  "answer": "Detailed answer",
  "risk_indicators": [
    { "level": "low|medium|high|critical", "category": "string", "description": "string", "confidence": number }
  ],
  "confidence_score": number (0-1),
  "source_reasoning": ["step 1", "step 2"]
}`,
      prompt: `Query: ${query}\n\nContext:\n${contextWithSources}`,
    })

    return parseJSON(text, StructuredOutputSchema, {
      summary: 'Analysis failed.',
      answer: 'Analysis failed.',
      risk_indicators: [],
      confidence_score: 0,
      source_reasoning: [],
    })
  } catch (error) {
    console.error('Structured output generation error:', error)
    throw error
  }
}

// Evaluate overall RAG pipeline quality
export async function evaluateRAGPipeline(
  query: string,
  retrievedChunks: Array<{ content: string; documentName?: string }>,
  response: string
): Promise<{
  retrieval_quality: number
  response_relevance: number
  faithfulness: number
  hallucination_risk: 'low' | 'medium' | 'high' | 'critical'
  overall_quality: number
  recommendations: string[]
}> {
  const retrievalGrade = await gradeRetrievalQuality(
    query,
    retrievedChunks.map(c => ({ content: c.content }))
  )

  const context = retrievedChunks
    .map((chunk, i) => `[Source ${i + 1}]: ${chunk.content}`)
    .join('\n\n')

  const responseGrade = await gradeResponseQuality(query, context, response)

  const overallQuality =
    retrievalGrade.retrieval_score * 0.3 +
    responseGrade.response_relevance * 0.3 +
    responseGrade.faithfulness * 0.4

  const recommendations: string[] = []

  if (retrievalGrade.retrieval_score < 0.5) {
    recommendations.push('Improve retrieval - consider expanding search or using different queries')
  }

  if (responseGrade.faithfulness < 0.7) {
    recommendations.push('Response contains unverified claims - verify with additional sources')
  }

  if (responseGrade.hallucination_risk === 'high' || responseGrade.hallucination_risk === 'critical') {
    recommendations.push('High hallucination risk detected - require human review')
  }

  return {
    retrieval_quality: retrievalGrade.retrieval_score,
    response_relevance: responseGrade.response_relevance,
    faithfulness: responseGrade.faithfulness,
    hallucination_risk: responseGrade.hallucination_risk,
    overall_quality: overallQuality,
    recommendations,
  }
}
