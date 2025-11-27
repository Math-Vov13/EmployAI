export async function GET(request: Request) {
  return new Response("GET /documents", {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(request: Request) {
  return new Response("POST /documents", {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
