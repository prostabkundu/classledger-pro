import { NextResponse } from "next/server"

export async function POST() {
  return new NextResponse(JSON.stringify({ ok: true }), {
    headers: { "Set-Cookie": "session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax; Secure" }
  })
}
