import { db } from './src/lib/db';

async function checkDb() {
    try {
        const docCount = await db.document.count();
        const chunkCount = await db.chunk.count();
        console.log(`Documents: ${docCount}`);
        console.log(`Chunks: ${chunkCount}`);

        if (docCount > 0) {
            const doc = await db.document.findFirst({ include: { chunks: true } });
            console.log('First Doc:', doc?.fileName, 'Status:', doc?.status);
        }
    } catch (error) {
        console.error('DB Error:', error);
    }
}

checkDb();
