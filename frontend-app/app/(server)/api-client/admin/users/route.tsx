export async function GET(request: Request) {
    return new Response("GET /admin/users", {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function POST(request: Request) {
    return new Response("POST /admin/users", {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}