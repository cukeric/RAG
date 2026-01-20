
import { db } from './src/lib/db'

async function checkPDF() {
    const pdfDoc = await db.document.findFirst({
        where: { fileType: 'application/pdf' },
        include: { chunks: true }
    })

    if (!pdfDoc) {
        console.log('No PDF document found in DB.')
        return
    }

    console.log(`Found PDF: ${pdfDoc.fileName} (ID: ${pdfDoc.id})`)
    console.log(`Status: ${pdfDoc.status}`)
    console.log(`Number of chunks: ${pdfDoc.chunks.length}`)

    if (pdfDoc.chunks.length > 0) {
        console.log('--- First Chunk Preview ---')
        console.log(pdfDoc.chunks[0].content.substring(0, 300))
        console.log('---------------------------')
    }
}

checkPDF()
    .catch(console.error)
    .finally(() => db.$disconnect())
