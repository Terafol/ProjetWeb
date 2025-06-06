const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const data = JSON.parse(fs.readFileSync('voyages.json', 'utf-8'));
  for (const voyage of data) {
    await prisma.voyage.create({ data: voyage });
  }
  console.log("✅ Import terminé !");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
