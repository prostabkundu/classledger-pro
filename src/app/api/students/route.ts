import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireOwner } from "@/lib/session"
import { z } from "zod"

const StudentSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  guardian: z.string().optional(),
  guardianPhone: z.string().optional(),
})

export async function GET() {
  requireOwner()
  const list = await prisma.student.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(list)
}

export async function POST(req: Request) {
  requireOwner()
  const data = StudentSchema.parse(await req.json())
  const st = await prisma.student.create({ data })
  return NextResponse.json(st, { status: 201 })
}
