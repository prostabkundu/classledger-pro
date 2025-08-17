import { NextResponse } from "next/server"
import { verifyOwner } from "@/lib/auth"

// add this helper
function sessionCookie(value: string) {
  const base = `session=${value}; HttpOnly; Path=/; SameSite=Lax`
  // In dev on http://localhost, do NOT set Secure
  return process.env.NODE_ENV === "production" ? `${base}; Secure` : base
}

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const user = await verifyOwner(email, password)
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  // avoid Buffer issues on Edge: use btoa
  const b64 = typeof Buffer !== "undefined"
    ? Buffer.from(JSON.stringify(user)).toString("base64")
    : btoa(JSON.stringify(user))

  return new NextResponse(JSON.stringify({ ok: true }), {
    headers: { "Set-Cookie": sessionCookie(b64) },
  })
}
