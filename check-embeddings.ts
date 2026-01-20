
import { db } from './src/lib/db'

async function checkEmbeddings() {
    try {
        const chunkCount = await db.chunk.count()
        console.log(`Total Chunks: ${chunkCount}`)

        const sampleChunks = await db.chunk.findMany({
            take: 5,
            select: {
                id: true,
                embedding: true,
                content: true
            }
        })

        console.log('--- Sample Chunks ---')
        for (const chunk of sampleChunks) {
            const embedding = JSON.parse(chunk.embedding as string)
            console.log(`Chunk ID: ${chunk.id}`)
            console.log(`Content Preview: ${chunk.content.substring(0, 50)}...`)
            console.log(`Embedding Length: ${Array.isArray(embedding) ? embedding.length : 'Invalid (not an array)'}`)
            console.log('---')
        }

        const emptyEmbeddings = await db.chunk.count({
            where: {
                embedding: {
                    equals: '[]'
                }
            }
        })
        console.log(`Chunks with empty embeddings: ${emptyEmbeddings}`)

    } catch (error) {
        console.error('Error checking embeddings:', error)
    }
}

checkEmbeddings()
