import { db } from '@/lib/db'

export interface ChunkingStrategy {
  name: string
  chunkSize: number
  overlap: number
}

export const chunkingStrategies: Record<string, ChunkingStrategy> = {
  fixed_small: { name: 'Fixed - Small', chunkSize: 500, overlap: 50 },
  fixed_medium: { name: 'Fixed - Medium', chunkSize: 1000, overlap: 200 },
  fixed_large: { name: 'Fixed - Large', chunkSize: 2000, overlap: 400 },
  recursive: { name: 'Recursive', chunkSize: 1000, overlap: 200 },
}

// Fixed-size chunking with overlap
export function chunkTextFixed(
  text: string,
  chunkSize: number,
  overlap: number
): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    let chunkEnd = end

    // Try to break at word boundary
    if (end < text.length && text[end] !== ' ') {
      const lastSpace = text.lastIndexOf(' ', end)
      if (lastSpace > start) {
        chunkEnd = lastSpace
      }
    }

    const chunk = text.slice(start, chunkEnd).trim()
    if (chunk.length > 0) {
      chunks.push(chunk)
    }
    start = chunkEnd - overlap
    if (start < 0) start = 0
  }

  return chunks
}

// Recursive chunking - splits by paragraphs, then sentences
export function chunkTextRecursive(
  text: string,
  chunkSize: number,
  overlap: number
): string[] {
  const chunks: string[] = []

  // First, split by paragraphs
  const paragraphs = text.split(/\n\s*\n/)

  let currentChunk = ''

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim()
    if (!trimmedParagraph) continue

    // If paragraph fits in current chunk
    if (currentChunk.length + trimmedParagraph.length <= chunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + trimmedParagraph
    } else {
      // Save current chunk if exists
      if (currentChunk) {
        chunks.push(currentChunk)
      }

      // If paragraph itself is too large, split it
      if (trimmedParagraph.length > chunkSize) {
        const sentences = trimmedParagraph.match(/[^.!?]+[.!?]+/g) || [trimmedParagraph]
        currentChunk = ''

        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length <= chunkSize) {
            currentChunk += (currentChunk ? ' ' : '') + sentence
          } else {
            if (currentChunk) {
              chunks.push(currentChunk)
            }
            currentChunk = sentence
          }
        }
      } else {
        currentChunk = trimmedParagraph
      }
    }
  }

  // Add the last chunk
  if (currentChunk) {
    chunks.push(currentChunk)
  }

  // Apply overlap
  if (overlap > 0 && chunks.length > 1) {
    for (let i = 1; i < chunks.length; i++) {
      const prevChunk = chunks[i - 1]
      const overlapText = prevChunk.slice(-overlap)
      chunks[i] = overlapText + chunks[i]
    }
  }

  return chunks.filter(c => c.trim().length > 0)
}

// Semantic chunking - uses sentence boundaries and semantic coherence
export async function chunkTextSemantic(
  text: string,
  maxChunkSize: number = 1000
): Promise<string[]> {
  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]

  const chunks: string[] = []
  let currentChunk = ''

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim()
    if (!trimmedSentence) continue

    if (currentChunk.length + trimmedSentence.length <= maxChunkSize) {
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence
    } else {
      if (currentChunk) {
        chunks.push(currentChunk)
      }
      currentChunk = trimmedSentence

      // If a single sentence is longer than maxChunkSize, split it
      while (currentChunk.length > maxChunkSize) {
        const splitPoint = currentChunk.lastIndexOf(' ', maxChunkSize)
        if (splitPoint > 0) {
          chunks.push(currentChunk.slice(0, splitPoint).trim())
          currentChunk = currentChunk.slice(splitPoint).trim()
        } else {
          chunks.push(currentChunk.slice(0, maxChunkSize))
          currentChunk = currentChunk.slice(maxChunkSize)
        }
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk)
  }

  return chunks.filter(c => c.trim().length > 0)
}

// Main chunking function that selects strategy
export function chunkText(
  text: string,
  strategy: string = 'recursive',
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  switch (strategy) {
    case 'fixed_small':
      return chunkTextFixed(text, 500, 50)
    case 'fixed_medium':
      return chunkTextFixed(text, 1000, 200)
    case 'fixed_large':
      return chunkTextFixed(text, 2000, 400)
    case 'recursive':
    default:
      return chunkTextRecursive(text, chunkSize, overlap)
  }
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Semantic search - find most relevant chunks
export async function semanticSearch(
  queryEmbedding: number[],
  topK: number = 5,
  minSimilarity: number = 0.5
): Promise<Array<{ chunk: any; similarity: number }>> {
  const chunks = await db.chunk.findMany({
    include: {
      document: true
    }
  })

  const results: Array<{ chunk: any; similarity: number }> = []

  for (const chunk of chunks) {
    const embedding = JSON.parse(chunk.embedding)
    if (embedding.length > 0) {
      const similarity = cosineSimilarity(queryEmbedding, embedding)
      if (similarity >= minSimilarity) {
        results.push({ chunk, similarity })
      }
    }
  }

  // Sort by similarity descending and return top K
  results.sort((a, b) => b.similarity - a.similarity)
  return results.slice(0, topK)
}
