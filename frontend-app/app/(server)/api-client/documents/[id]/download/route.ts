export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    return new Response(`GET /documents/${params.id}/download`, {
        status: 200,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename="document.pdf"',
        },
    });
}
