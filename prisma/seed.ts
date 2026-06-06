import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLEANERS = [
  { name: "Maya Cohen", phone: "050-111-1111", rating: 4.9, jobsDone: 312, lat: 32.087, lng: 34.782 },
  { name: "Daniel Levy", phone: "050-222-2222", rating: 4.8, jobsDone: 198, lat: 32.084, lng: 34.779 },
  { name: "Sarah Gold", phone: "050-333-3333", rating: 5.0, jobsDone: 421, lat: 32.089, lng: 34.785 },
  { name: "Yosef Ben-Ami", phone: "050-444-4444", rating: 4.7, jobsDone: 156, lat: 32.082, lng: 34.776 },
  { name: "Noa Shapira", phone: "050-555-5555", rating: 4.95, jobsDone: 267, lat: 32.091, lng: 34.788 },
];

async function main() {
  await prisma.booking.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.cleaner.deleteMany();

  for (const cleaner of CLEANERS) {
    await prisma.cleaner.create({
      data: { ...cleaner, isOnline: true },
    });
  }

  console.log(`Seeded ${CLEANERS.length} cleaners`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
