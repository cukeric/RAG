
import { embedQuery, findSimilarChunks } from './src/lib/embedding-service'
import { generateStructuredOutput, evaluateRAGPipeline } from './src/lib/self-rag-grader'
import fs from 'fs'
import path from 'path'

const queries = [
    {
        id: 2,
        name: "Manufacturing Quality",
        question: "What is total production output for Q4 2024 and what is the first pass yield rate?"
    },
    {
        id: 3,
        name: "Productivity Analysis",
        question: "Which department has the highest efficiency rating and what are the efficiency percentages for all departments?"
    },
    {
        id: 4,
        name: "Project Management",
        question: "Which projects are over budget and by how much? Show the top 3 by variance amount."
    },
    {
        id: 5,
        name: "Financial Performance",
        question: "What is the operating profit margin and how does it compare to gross profit margin? Provide the net income as well."
    },
    {
        id: 6,
        name: "Risk Assessment",
        question: "What are the critical risks requiring immediate attention and what mitigation strategies are recommended?"
    },
    {
        id: 7,
        name: "Strategic Planning",
        question: "What are the four strategic pillars and their primary goals? Also, what is the implementation timeline from Q4 2024 to 2027?"
    },
    {
        id: 8,
        name: "Image Analysis",
        question: "What strategic elements are shown in the visual diagram? Describe the timeline and any color coding."
    },
    {
        id: 9,
        name: "Cross-Document Synthesis",
        question: "Provide a comprehensive analysis of company performance including: 1. Manufacturing quality metrics 2. Productivity and efficiency 3. Financial performance 4. Strategic initiatives 5. Key risks and mitigation"
    },
    {
        id: 10,
        name: "Hallucination Detection",
        question: "What is the company's carbon footprint and sustainability certification status for 2024?"
    }
]

async function runSuite() {
    console.log(`🧪 Starting RAG Test Suite (${queries.length} queries)...`)

    let report = `# RAG Test Suite Findings - ${new Date().toLocaleDateString()}\n\n`
    report += `## Summary statistics\n\n`

    let results = []

    for (const q of queries) {
        console.log(`\n🔍 Running Test ${q.id}: ${q.name}...`)
        try {
            const start = Date.now()
            const embedding = await embedQuery(q.question)
            const similarChunks = await findSimilarChunks(embedding, 5, 0.25)

            const context = similarChunks.map(c => c.chunk.content).join('\n\n')
            const chunksWithDocs = similarChunks.map(c => ({
                content: c.chunk.content,
                documentName: c.chunk.document.fileName
            }))

            const structuredOutput = await generateStructuredOutput(q.question, context, chunksWithDocs)
            const evaluation = await evaluateRAGPipeline(q.question, chunksWithDocs, structuredOutput.answer)
            const duration = (Date.now() - start) / 1000

            console.log(`✅ Completed in ${duration.toFixed(2)}s. Confidence: ${structuredOutput.confidence_score}`)

            results.push({
                ...q,
                output: structuredOutput,
                eval: evaluation,
                duration,
                chunks: chunksWithDocs
            })
        } catch (error) {
            console.error(`❌ Test ${q.id} failed:`, error)
            results.push({
                ...q,
                error: error instanceof Error ? error.message : String(error)
            })
        }
    }

    // Build Report
    const total = results.length
    const passed = results.filter(r => !r.error && r.eval && r.eval.overall_quality > 0.6).length

    report += `- **Total Queries:** ${total}\n`
    report += `- **Pass Rate:** ${((passed / total) * 100).toFixed(1)}%\n`
    report += `- **Avg Response Time:** ${(results.reduce((acc, r) => acc + (r.duration || 0), 0) / total).toFixed(2)}s\n\n`

    report += `## Detailed Findings\n\n`

    for (const r of results) {
        report += `### Test ${r.id}: ${r.name}\n`
        report += `**Query:** \`${r.question}\`\n\n`

        if (r.error) {
            report += `❌ **FAILED:** ${r.error}\n\n`
            continue
        }

        report += `**Status:** ${r.eval.overall_quality > 0.6 ? '✅ PASS' : '⚠️ REVIEW'}\n`
        report += `- **Confidence Score:** ${r.output.confidence_score}\n`
        report += `- **Retrieval Quality:** ${r.eval.retrieval_quality}\n`
        report += `- **Faithfulness:** ${r.eval.faithfulness}\n`
        report += `- **Hallucination Risk:** ${r.eval.hallucination_risk}\n`
        report += `- **Response Time:** ${r.duration.toFixed(2)}s\n\n`

        report += `#### Summary\n> ${r.output.summary}\n\n`
        report += `#### Answer\n${r.output.answer}\n\n`

        if (r.output.risk_indicators.length > 0) {
            report += `#### Risk Indicators\n`
            r.output.risk_indicators.forEach(ri => {
                report += `- [${ri.level.toUpperCase()}] ${ri.category}: ${ri.description} (Conf: ${ri.confidence})\n`
            })
            report += `\n`
        }

        report += `#### Sources Used\n`
        const sources = Array.from(new Set(r.chunks.map(c => c.documentName)))
        sources.forEach(s => report += `- ${s}\n`)
        report += `\n---\n\n`
    }

    fs.writeFileSync('TEST_FINDINGS_JAN_19.md', report)
    console.log('\n🏁 Suite complete! Findings saved to TEST_FINDINGS_JAN_19.md')
}

runSuite().catch(console.error)
