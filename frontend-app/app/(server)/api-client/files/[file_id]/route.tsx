export async function GET(
    request: Request,
    { params }: { params: { file_id: string } }
) {
    return new Response(`GET /files/${params.file_id}`);
}

export async function DELETE(
    request: Request,
    { params }: { params: { file_id: string } }
) {
    return new Response(`DELETE /files/${params.file_id}`);
}
