import { getDatabase } from "@/app/lib/db/mongodb";

export async function POST(request: Request) {
  const db = await getDatabase();
  return new Response("POST /admin (token)");
}
