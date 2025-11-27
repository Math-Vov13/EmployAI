export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ user_id: string; role_id: string }> },
) {
  const { user_id, role_id } = await params;
  return new Response(`DELETE /admin/users/${user_id}/roles/${role_id}`, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
