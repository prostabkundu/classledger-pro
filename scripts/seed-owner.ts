import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  // bcryptjs hash for password "CHANGE_ME"
  const hash = "$2a$10$lPdwxDsSKDtJPQTOIIJRwutl/.KR2Oj9RYi88tgMZ.tIndjrvDR.2"
  await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: { email: "owner@example.com", password: hash, role: "OWNER" },
  })
  console.log("Owner seeded: owner@example.com / CHANGE_ME")
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)})
