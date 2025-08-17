import { cookies } from "next/headers"

function decodeBase64(input: string) {
  // Works both on Node and Edge
  if (typeof Buffer !== "undefined") return Buffer.from(input, "base64").toString()
  // @ts-ignore
  return new TextDecoder().decode(Uint8Array.from(atob(input), c => c.charCodeAt(0)))
}

export function getSession() {
  const raw = cookies().get("session")?.value
  if (!raw) return null
  try {
    return JSON.parse(decodeBase64(raw))
  } catch {
    return null
  }
}

export function requireOwner() {
  const s = getSession()
  if (!s || s.role !== "OWNER") throw new Error("UNAUTH")
  return s
}
