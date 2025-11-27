export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    return new Response(`GET /documents/${params.id}`, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    return new Response(`PUT /documents/${params.id}`, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    return new Response(`DELETE /documents/${params.id}`, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}