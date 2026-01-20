import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { embedQuery, findSimilarChunks } from '@/lib/embedding-service'
import {
  generateStructuredOutput,
  evaluateRAGPipeline,
} from '@/lib/self-rag-grader'

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()
    console.log(`[QUERY] Received question: ${question}`)

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    // Generate embedding for the query
    console.log('[QUERY] Generating query embedding...')
    const queryEmbedding = await embedQuery(question)
    console.log('[QUERY] Embedding generated. Finding similar chunks...')

    // Find similar chunks - MiniLM produces lower scores, so we use 0.25
    const similarChunks = await findSimilarChunks(queryEmbedding, 5, 0.25)
    console.log(`[QUERY] Found ${similarChunks.length} chunks.`)

    if (similarChunks.length === 0) {
      return NextResponse.json({
        answer:
          'I could not find relevant information in the uploaded documents to answer your question. Please try uploading more relevant documents or rephrase your question.',
        summary:
          'No relevant information found in the document corpus.',
        confidenceScore: 0,
        riskIndicators: [],
        citations: [],
        sourceReasoning: [],
      })
    }

    // Prepare context for generation
    const context = similarChunks
      .map((result) => result.chunk.content)
      .join('\n\n')

    // Generate structured output
    const structuredOutput = await generateStructuredOutput(
      question,
      context,
      similarChunks.map((result) => ({
        content: result.chunk.content,
        documentName: result.chunk.document.fileName,
      }))
    )

    // Create citations
    const citations = similarChunks.map((result, index) => ({
      chunkId: result.chunk.id,
      content: result.chunk.content,
      documentName: result.chunk.document.fileName,
      relevance: result.similarity,
      page: JSON.parse(result.chunk.metadata || '{}').page,
    }))

    // Evaluate RAG pipeline quality
    const evaluation = await evaluateRAGPipeline(
      question,
      similarChunks.map((result) => ({
        content: result.chunk.content,
        documentName: result.chunk.document.fileName,
      })),
      structuredOutput.answer
    )

    // Create query record
    const queryRecord = await db.query.create({
      data: {
        question,
        answer: structuredOutput.answer,
        summary: structuredOutput.summary,
        riskIndicators: JSON.stringify(structuredOutput.risk_indicators),
        confidenceScore: structuredOutput.confidence_score,
        sourceReasoning: JSON.stringify(structuredOutput.source_reasoning),
      },
    })

    // Save RAG grades
    await db.ragGrade.create({
      data: {
        queryId: queryRecord.id,
        gradeType: 'retrieval_quality',
        score: evaluation.retrieval_quality,
        reason: 'Retrieved chunks relevance score',
      },
    })

    await db.ragGrade.create({
      data: {
        queryId: queryRecord.id,
        gradeType: 'response_relevance',
        score: evaluation.response_relevance,
        reason: 'Response relevance to query',
      },
    })

    await db.ragGrade.create({
      data: {
        queryId: queryRecord.id,
        gradeType: 'hallucination_check',
        score: evaluation.faithfulness,
        reason: `Hallucination risk: ${evaluation.hallucination_risk}`,
      },
    })

    // Save citations
    for (const citation of citations) {
      await db.citation.create({
        data: {
          chunkId: citation.chunkId,
          queryId: queryRecord.id,
          relevance: citation.relevance,
          used: true,
        },
      })
    }

    return NextResponse.json({
      id: queryRecord.id,
      question,
      answer: structuredOutput.answer,
      summary: structuredOutput.summary,
      confidenceScore: structuredOutput.confidence_score,
      riskIndicators: structuredOutput.risk_indicators,
      citations,
      sourceReasoning: structuredOutput.source_reasoning,
      evaluation,
    })
  } catch (error) {
    console.error('Query error:', error)
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const queries = await db.query.findMany({
      include: {
        citations: {
          include: {
            chunk: {
              include: {
                document: true,
              },
            },
          },
        },
        ragGrades: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json({ queries })
  } catch (error) {
    console.error('Error fetching queries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queries' },
      { status: 500 }
    )
  }
}
