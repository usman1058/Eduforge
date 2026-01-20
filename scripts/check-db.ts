import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const userCount = await prisma.user.count()
  const serviceCount = await prisma.service.count()
  const settingCount = await prisma.systemSetting.count()

  console.log("Database Statistics:")
  console.log("- Users:", userCount)
  console.log("- Services:", serviceCount)
  console.log("- Settings:", settingCount)

  if (userCount === 0) {
    console.log("\n⚠️  No users found. Seed may not have run properly.")
  } else {
    console.log("\n✅ Database has been seeded successfully!")
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
