import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { processDocument } from '@/lib/document-processor'
import { Document } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const results: Document[] = []

    for (const file of files) {
      try {
        // Create document record
        const document = await db.document.create({
          data: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            status: 'pending',
            metadata: JSON.stringify({
              uploadedAt: new Date().toISOString(),
              originalName: file.name,
            }),
          },
        })

        // Get file buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Process document (extract text, chunk, embed)
        await processDocument(document.id, buffer, file.type, file.name)

        // Get updated document
        const updatedDocument = await db.document.findUnique({
          where: { id: document.id },
          include: { chunks: true },
        })

        if (updatedDocument) {
          results.push(updatedDocument)
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        // Continue processing other files even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      documents: results,
      message: `Successfully processed ${results.length} of ${files.length} file(s)`,
    })
  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process documents' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    await db.document.deleteMany({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Document deleted' })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const documents = await db.document.findMany({
      include: {
        chunks: true,
        _count: {
          select: {
            chunks: true,
            queries: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}
