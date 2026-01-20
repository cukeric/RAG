import { db } from '@/lib/db'
import { chunkTextRecursive } from '@/lib/rag'
import { embedAllChunks } from '@/lib/embedding-service'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import mammoth from 'mammoth'
import Tesseract from 'tesseract.js'
import path from 'path'

// Bypass index.js buggy debug code in pdf-parse
const pdf = require('pdf-parse/lib/pdf-parse.js')

// Extract text from PDF using pdf-parse (bypassing buggy index.js)
export async function extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
  try {
    const data = await pdf(fileBuffer)
    return data.text
  } catch (error) {
    console.error('PDF extraction error:', error)
    return `[Error extracting PDF content: ${error instanceof Error ? error.message : 'Unknown error'}]`
  }
}

// Extract text from CSV
export async function extractTextFromCSV(fileBuffer: Buffer): Promise<string> {
  const csvText = fileBuffer.toString('utf-8')
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  let extractedText = ''
  const data = parsed.data as Record<string, any>[]

  for (const row of data) {
    const rowText = Object.values(row).join(' | ')
    extractedText += `${rowText}\n`
  }

  return extractedText
}

// Extract text from Excel using SheetJS (supports .xls and .xlsx)
export async function extractTextFromExcel(fileBuffer: Buffer): Promise<string> {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    let extractedText = ''

    workbook.SheetNames.forEach(sheetName => {
      extractedText += `Sheet: ${sheetName}\n`
      const sheet = workbook.Sheets[sheetName]
      const csv = XLSX.utils.sheet_to_csv(sheet)
      extractedText += csv + '\n\n'
    })

    return extractedText
  } catch (error) {
    console.error('Excel extraction error:', error)
    throw new Error(`Failed to extract Excel content: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Extract text from plain text
export function extractTextFromTXT(fileBuffer: Buffer): string {
  return fileBuffer.toString('utf-8')
}

// Extract text from Word Documents (DOCX) using mammoth
export async function extractTextFromDOCX(fileBuffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer })
    return result.value
  } catch (error) {
    console.error('DOCX extraction error:', error)
    return `[Error extracting DOCX content: ${error instanceof Error ? error.message : 'Unknown error'}]`
  }
}

// Process image using Tesseract.js (Local OCR)
export async function extractTextFromImage(
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  let worker: Tesseract.Worker | null = null;
  try {
    console.log(`[OCR] Starting identification for ${fileName}...`)

    // In some environments, we might need to explicitly define the worker path
    // Create worker with more explicit configuration for Node/Next.js environment
    console.log(`[OCR] Creating worker for ${fileName}...`)
    worker = await Tesseract.createWorker('eng', 1, {
      workerPath: path.resolve('node_modules/tesseract.js/src/worker-script/node/index.js'),
      corePath: path.resolve('node_modules/tesseract.js-core/tesseract-core.wasm.js'),
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`[OCR] ${fileName}: ${Math.round(m.progress * 100)}%`)
        } else {
          console.log(`[OCR] ${fileName} Status: ${m.status}`)
        }
      }
    })

    console.log(`[OCR] Running recognize for ${fileName}...`)
    const result = await worker.recognize(fileBuffer)

    console.log(`[OCR] Completed for ${fileName}`)
    return result.data.text || '[No text found in image]'
  } catch (error) {
    console.error(`[OCR] Error in extractTextFromImage for ${fileName}:`, error)
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (msg.includes('worker-script') || msg.includes('MODULE_NOT_FOUND')) {
      return `[OCR Error: Tesseract environment issue. The worker script could not be initialized in this environment. Detail: ${msg}]`;
    }
    return `[Error extracting text from image: ${msg}]`
  } finally {
    if (worker) {
      console.log(`[OCR] Terminating worker for ${fileName}...`)
      await worker.terminate()
    }
  }
}

// Main document processor
export async function processDocument(
  fileId: string,
  fileBuffer: Buffer,
  fileType: string,
  fileName: string
): Promise<void> {
  let extractedText = ''

  // Update document status to processing
  await db.document.update({
    where: { id: fileId },
    data: { status: 'processing' },
  })

  try {
    // Extract text based on file type
    switch (fileType) {
      case 'application/pdf':
        extractedText = await extractTextFromPDF(fileBuffer)
        break

      case 'text/csv':
        extractedText = await extractTextFromCSV(fileBuffer)
        break

      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'application/excel':
      case 'application/x-excel':
      case 'application/x-msexcel':
        extractedText = await extractTextFromExcel(fileBuffer)
        break

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        extractedText = await extractTextFromDOCX(fileBuffer)
        break

      case 'text/plain':
        extractedText = extractTextFromTXT(fileBuffer)
        break

      case 'image/jpeg':
      case 'image/png':
      case 'image/webp':
      case 'image/jpg':
      case 'image/gif':
        extractedText = await extractTextFromImage(fileBuffer, fileName)
        break

      default:
        // Attempt based on file extension if mime type is generic
        if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
          extractedText = await extractTextFromExcel(fileBuffer)
        } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
          extractedText = await extractTextFromDOCX(fileBuffer)
        } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png')) {
          extractedText = await extractTextFromImage(fileBuffer, fileName)
        } else {
          throw new Error(`Unsupported file type: ${fileType}`)
        }
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text content extracted from document')
    }

    // Chunk the text using recursive strategy
    const chunks = chunkTextRecursive(extractedText, 1000, 200)

    // Store chunks
    for (let i = 0; i < chunks.length; i++) {
      await db.chunk.create({
        data: {
          documentId: fileId,
          content: chunks[i],
          chunkIndex: i,
          embedding: JSON.stringify([]), // Will be populated by embedding service
          metadata: JSON.stringify({
            chunkSize: chunks[i].length,
            position: i + 1,
          }),
        },
      })
    }

    // Update document status to completed
    await db.document.update({
      where: { id: fileId },
      data: {
        status: 'completed',
        processedAt: new Date(),
        metadata: JSON.stringify({
          chunkCount: chunks.length,
          totalChars: extractedText.length,
          extractionMethod: 'standard',
        }),
      },
    })

    // Generate embeddings for all chunks asynchronously
    embedAllChunks().catch((error) => {
      console.error('Embedding generation failed:', error)
    })
  } catch (error) {
    console.error(`Error processing document ${fileId}:`, error)

    // Update document status to failed
    await db.document.update({
      where: { id: fileId },
      data: {
        status: 'failed',
        metadata: JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      },
    })

    throw error
  }
}

// Batch process documents
export async function batchProcessDocuments(
  documents: Array<{
    id: string
    buffer: Buffer
    type: string
    name: string
  }>
): Promise<void> {
  for (const doc of documents) {
    try {
      await processDocument(doc.id, doc.buffer, doc.type, doc.name)
    } catch (error) {
      console.error(`Failed to process document ${doc.id}:`, error)
    }
  }
}

// Delete document and associated data
export async function deleteDocument(documentId: string): Promise<void> {
  await db.document.delete({
    where: { id: documentId },
  })
}

// Get document statistics
export async function getDocumentStatistics() {
  const totalDocuments = await db.document.count()
  const totalChunks = await db.chunk.count()
  const completedDocuments = await db.document.count({
    where: { status: 'completed' },
  })
  const failedDocuments = await db.document.count({
    where: { status: 'failed' },
  })

  return {
    totalDocuments,
    totalChunks,
    completedDocuments,
    failedDocuments,
    successRate: totalDocuments > 0 ? (completedDocuments / totalDocuments) * 100 : 0,
  }
}
