
// Simple script to verify dependencies load correctly
async function checkDependencies() {
    console.log('🔍 Verifying extraction dependencies...')

    try {
        const pdf = require('pdf-parse')
        console.log('✅ pdf-parse loaded')
    } catch (e) {
        console.error('❌ pdf-parse failed:', e)
    }

    try {
        const mammoth = require('mammoth')
        console.log('✅ mammoth loaded')
    } catch (e) {
        console.error('❌ mammoth failed:', e)
    }

    try {
        const Tesseract = require('tesseract.js')
        console.log('✅ tesseract.js loaded')
    } catch (e) {
        console.error('❌ tesseract.js failed:', e)
    }
}

checkDependencies()
