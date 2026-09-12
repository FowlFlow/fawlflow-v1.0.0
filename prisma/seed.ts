import "dotenv/config";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function generateRecoveryCode(): string {
  return randomBytes(5).toString("hex").toUpperCase();
}

async function main() {
  await prisma.farm.upsert({
    where: { id: "main-farm" },
    update: {},
    create: { id: "main-farm", name: "My Farm" },
  });

  await prisma.eggTurn.upsert({
    where: { name: "Morning" },
    update: {},
    create: { name: "Morning", sortOrder: 1 },
  });
  await prisma.eggTurn.upsert({
    where: { name: "Evening" },
    update: {},
    create: { name: "Evening", sortOrder: 2 },
  });

  await prisma.eggBoxType.upsert({
    where: { name: "260-egg box" },
    update: {},
    create: { name: "260-egg box", eggsPerBox: 260 },
  });
  await prisma.eggBoxType.upsert({
    where: { name: "300-egg box" },
    update: {},
    create: { name: "300-egg box", eggsPerBox: 300 },
  });

  const existingUser = await prisma.user.findUnique({ where: { username: "admin" } });
  if (!existingUser) {
    const password = "fowlflow123";
    const recoveryCode = generateRecoveryCode();

    await prisma.user.create({
      data: {
        username: "admin",
        passwordHash: await bcrypt.hash(password, 10),
        recoveryCodeHash: await bcrypt.hash(recoveryCode, 10),
      },
    });

    console.log("\n=== FowlFlow initial login ===");
    console.log(`Username: admin`);
    console.log(`Password: ${password}`);
    console.log(`Recovery code (save this, shown only once): ${recoveryCode}`);
    console.log("================================\n");
  } else {
    console.log("User 'admin' already exists, skipping.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
