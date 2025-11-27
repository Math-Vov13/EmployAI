//toujours à faire :')
export async function GET(request: Request) {
  return new Response("GET /auth/google", {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
