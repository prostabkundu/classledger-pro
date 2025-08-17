import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireOwner } from "@/lib/session"
import { z } from "zod"

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  guardian: z.string().optional(),
  guardianPhone: z.string().optional(),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  requireOwner()
  const data = UpdateSchema.parse(await req.json())
  const st = await prisma.student.update({ where: { id: params.id }, data })
  return NextResponse.json(st)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  requireOwner()
  await prisma.student.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
