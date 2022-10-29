import type { Ingredient } from "@prisma/client";
import { prisma } from "~/db.server";

export type { Ingredient } from "@prisma/client";

export async function getIngredients() {
  return prisma.ingredient.findMany();
}

export async function getIngredientById(id: Ingredient["id"]) {
  return prisma.ingredient.findUnique({ where: { id } });
}

export async function createIngredient(ingredient: Omit<Ingredient, "id">) {
  return prisma.ingredient.create({
    data: ingredient,
  });
}

export async function editIngredient(ingredient: Ingredient) {
  return prisma.ingredient.update({
    where: { id: ingredient.id },
    data: ingredient,
  });
}

export async function deleteIngredientById(id: Ingredient["id"]) {
  return prisma.ingredient.delete({ where: { id } });
}
