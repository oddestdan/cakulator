import { PrismaClient } from "@prisma/client";
import { createIngredient } from "~/models/ingredient.server";

const prisma = new PrismaClient();

async function seed() {
  const created = [
    { name: "Сахар", price: 3.5, weight: 100, unit: "г" },
    { name: "Мука", price: 2, weight: 100, unit: "г" },
    { name: "Яйца", price: 5, weight: 1, unit: "шт" },
    { name: "Масло сливочное", price: 28, weight: 100, unit: "г" },
    { name: "Ванильный сахар", price: 20, weight: 100, unit: "г" },
    { name: "Какао", price: 30, weight: 100, unit: "г" },
    { name: "Разрыхлитель", price: 40, weight: 100, unit: "г" },
    { name: "Сливки 33%", price: 17.2, weight: 100, unit: "г" },
  ].map(async (ingredient) => {
    return await createIngredient(ingredient);
  });

  console.log("Created ingredients:");
  console.log(await Promise.all(created));

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
