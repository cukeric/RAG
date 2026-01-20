
import { db } from './src/lib/db'
import { generateEmbedding } from './src/lib/embedding-service'

async function reindexDatabase() {
    console.log('Starting database re-indexing...')

    try {
        const chunks = await db.chunk.findMany()
        console.log(`Found ${chunks.length} chunks to re-process.`)

        let successCount = 0

        for (const chunk of chunks) {
            console.log(`Processing chunk ${chunk.id}...`)
            try {
                const embedding = await generateEmbedding(chunk.content)

                await db.chunk.update({
                    where: { id: chunk.id },
                    data: {
                        embedding: JSON.stringify(embedding)
                    }
                })
                successCount++
            } catch (err) {
                console.error(`Failed to re-embed chunk ${chunk.id}`, err)
            }
        }

        console.log(`Re-indexing complete. Successfully updated ${successCount}/${chunks.length} chunks.`)

    } catch (error) {
        console.error('Re-indexing failed:', error)
    }
}

reindexDatabase()
