
import { db } from './src/lib/db'

async function resetDB() {
    console.log('🗑️  Cleaning up database...')

    // Delete in order of foreign key constraints
    await db.citation.deleteMany({})
    await db.ragGrade.deleteMany({})
    await db.query.deleteMany({})
    await db.chunk.deleteMany({})
    await db.document.deleteMany({})

    console.log('✅ Database fully reset. Ready for fresh uploads.')
}

resetDB()
    .catch(console.error)
    .finally(() => db.$disconnect())
