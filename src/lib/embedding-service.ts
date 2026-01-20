import { db } from '@/lib/db'

// Use globalThis to persist pipeline across hot reloads in dev
const globalForPipeline = globalThis as unknown as { pipeline: any }

async function getPipeline() {
  if (globalForPipeline.pipeline) return globalForPipeline.pipeline

  console.log('[EMBED] Importing transformers...')
  const { pipeline: transformerPipeline, env } = await import('@xenova/transformers')

  // Configure cache directory to be writable
  env.cacheDir = './.cache'
  env.allowLocalModels = false // Force download if not present (or true if you want strictly local)
  env.useBrowserCache = false

  console.log('[EMBED] Creating pipeline...')
  // Use a high-quality, efficient model for RAG
  globalForPipeline.pipeline = await transformerPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  console.log('[EMBED] Pipeline created.')
  return globalForPipeline.pipeline
}

// Generate embedding for a single text using local model
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log('[EMBED] Getting pipeline...')
    const extractor = await getPipeline()
    console.log('[EMBED] Pipeline ready. Extracting...')
    const output = await extractor(text, { pooling: 'mean', normalize: true })
    console.log('[EMBED] Extraction complete.')
    return Array.from(output.data)
  } catch (error) {
    console.error('Embedding generation error:', error)
    throw error // Fail hard if embedding fails, don't use fallback
  }
}

// Generate embeddings for multiple texts (batch processing)
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = []
  for (const text of texts) {
    const embedding = await generateEmbedding(text)
    embeddings.push(embedding)
  }
  return embeddings
}

// Generate and store embeddings for all chunks
export async function embedAllChunks(): Promise<void> {
  // Find chunks that have placeholder embeddings (empty arrays) or old format
  // Note: We'll just process everything that looks suspicious or explicitly all
  // For safety, let's grab chunks where embedding is "[]"
  const chunks = await db.chunk.findMany({
    where: {
      embedding: JSON.stringify([]),
    },
  })

  console.log(`Found ${chunks.length} chunks to embed`)

  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk.content)
      await db.chunk.update({
        where: { id: chunk.id },
        data: {
          embedding: JSON.stringify(embedding),
        },
      })
      console.log(`Embedded chunk ${chunk.id}`)
    } catch (error) {
      console.error(`Failed to embed chunk ${chunk.id}:`, error)
    }
  }
}

// Generate embedding for a query
export async function embedQuery(query: string): Promise<number[]> {
  return generateEmbedding(query)
}

// Calculate cosine similarity between two embeddings
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    // If lengths differ (e.g. 384 vs 1536), return 0 to avoid crash
    // This happens when switching models
    return 0
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  // Handle zero vectors
  if (normA === 0 || normB === 0) return 0

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Find similar chunks based on query embedding
export async function findSimilarChunks(
  queryEmbedding: number[],
  topK: number = 5,
  minSimilarity: number = 0.2 // Lower threshold for MiniLM
): Promise<
  Array<{
    chunk: any
    similarity: number
  }>
> {
  const chunks = await db.chunk.findMany({
    include: {
      document: true,
    },
  })

  const results: Array<{ chunk: any; similarity: number }> = []

  for (const chunk of chunks) {
    try {
      const embedding = JSON.parse(chunk.embedding)
      if (embedding.length > 0) {
        const similarity = cosineSimilarity(queryEmbedding, embedding)
        if (similarity >= minSimilarity) {
          results.push({ chunk, similarity })
        }
      }
    } catch (error) {
      console.error(`Error parsing embedding for chunk ${chunk.id}:`, error)
    }
  }

  // Sort by similarity descending and return top K
  results.sort((a, b) => b.similarity - a.similarity)
  return results.slice(0, topK)
}
