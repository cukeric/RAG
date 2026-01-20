
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
        }

        await db.document.delete({
            where: { id },
        })

        return NextResponse.json({ success: true, message: 'Document deleted' })
    } catch (error) {
        console.error('Delete error:', error)
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
    }
}
