export async function GET(
  request: Request,
  { params }: { params: Promise<{ user_id: string }> },
) {
  const { user_id } = await params;
  return new Response(`GET /admin/users/${user_id}`, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ user_id: string }> },
) {
  const { user_id } = await params;
  return new Response(`PUT /admin/users/${user_id}`, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ user_id: string }> },
) {
  const { user_id } = await params;
  return new Response(`DELETE /admin/users/${user_id}`, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
