import bcrypt from "bcryptjs"
import { prisma } from "./db"

export async function verifyOwner(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) return null
  const ok = await bcrypt.compare(password, user.password)
  return ok ? { id: user.id, email: user.email, role: user.role } : null
}
