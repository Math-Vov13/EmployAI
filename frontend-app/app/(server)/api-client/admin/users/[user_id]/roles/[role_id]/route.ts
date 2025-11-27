export async function DELETE(
    request: Request,
    { params }: { params: { user_id: string; role_id: string } }
) {
    return new Response(
        `DELETE /admin/users/${params.user_id}/roles/${params.role_id}`,
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
}
