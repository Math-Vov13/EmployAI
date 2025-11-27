// A FAIRE :)
export async function GET(request: Request) {
  return new Response("GET /auth/google/callback", {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
