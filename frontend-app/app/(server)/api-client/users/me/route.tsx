export async function GET(request: Request) {
    return new Response("GET /users/me", {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
