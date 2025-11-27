export async function GET(
    request: Request,
    { params }: { params: { user_id: string } }
) {
    return new Response(`GET /admin/users/${params.user_id}`, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function PUT(
    request: Request,
    { params }: { params: { user_id: string } }
) {
    return new Response(`PUT /admin/users/${params.user_id}`, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function DELETE(
    request: Request,
    { params }: { params: { user_id: string } }
) {
    return new Response(`DELETE /admin/users/${params.user_id}`, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}