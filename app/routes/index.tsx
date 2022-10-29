import { Button, Input, Option, Select } from "@material-tailwind/react";
import { useCallback, useRef, useState } from "react";
import * as OutlinedIcons from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { AddIngredient } from "~/components/AddIngredient";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import type { Ingredient as IIngredient } from "~/models/ingredient.server";
import {
  createIngredient,
  deleteIngredientById,
  editIngredient,
} from "~/models/ingredient.server";
import { getIngredients } from "~/models/ingredient.server";
import { Ingredient } from "~/components/Ingredient";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";

export type UnitType = "г" | "шт";

export interface ICountableIngredient extends IIngredient {
  count?: number;
}

const mapCountedIngredient = ({
  price,
  weight,
  count,
  ...rest
}: ICountableIngredient): IIngredient => ({
  ...rest,
  price: price * (count || 1),
  weight: weight * (count || 1),
});

type LoaderData = {
  ingredients: IIngredient[];
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const method = request.method;

  switch (method) {
    case "POST": {
      console.log(">> adding ingredient");

      // Create
      const name = formData.get("name");
      const price = Number(formData.get("price"));
      const unit = formData.get("unit");
      const weight = Number(formData.get("weight"));

      invariant(typeof name === "string", "name must be a string");
      invariant(typeof price === "number", "price must be a number");
      invariant(typeof unit === "string", "unit must be a string");
      invariant(typeof weight === "number", "weight must be a number");

      console.log({ name, price, unit, weight });

      return await createIngredient({
        name,
        price,
        unit,
        weight,
      });
    }
    case "PUT": {
      console.log(">> editing ingredient");

      // Edit
      const id = formData.get("ingredientId");
      const name = formData.get("name");
      const price = Number(formData.get("price"));
      const unit = formData.get("unit");
      const weight = Number(formData.get("weight"));

      invariant(typeof id === "string", "id must be a string");
      invariant(typeof name === "string", "name must be a string");
      invariant(typeof price === "number", "price must be a number");
      invariant(typeof unit === "string", "unit must be a string");
      invariant(typeof weight === "number", "weight must be a number");

      console.log({ id, name, price, unit, weight });

      return await editIngredient({ id, name, price, unit, weight });
    }
    case "DELETE": {
      console.log(">> deleting ingredient");

      // Delete
      const id = formData.get("ingredientId");

      invariant(typeof id === "string", "ingredientId must be a string");

      console.log({ id });
      return await deleteIngredientById(id);
    }
    default:
      return null;
  }
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const ingredients = await getIngredients();
  if (!ingredients) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ ingredients });
};

export default function Index() {
  const { ingredients } = useLoaderData() as LoaderData;
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);

  const [filteredIngredients, setFilteredIngredients] =
    useState<IIngredient[]>(ingredients);
  const [receipt, setReceipt] = useState<Record<string, ICountableIngredient>>(
    {}
  );
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [receiptName, setReceiptName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [localReceipts, setLocalReceipts] = useState<any[]>([]);
  const [editOverrides, setEditOverrides] = useState<IIngredient | undefined>(
    undefined
  );

  const addIngredient = useCallback(
    (ingredient: Omit<IIngredient, "id">) => {
      const formData = new FormData(formRef.current || undefined);
      formData.set("name", ingredient.name);
      formData.set("price", ingredient.price.toString());
      formData.set("unit", ingredient.unit);
      formData.set("weight", ingredient.weight.toString());
      submit(formData, { method: "post" });
    },
    [submit]
  );

  const editIngredient = useCallback(
    (ingredient: IIngredient) => {
      const formData = new FormData(formRef.current || undefined);
      formData.set("ingredientId", ingredient.id);
      formData.set("name", ingredient.name);
      formData.set("price", ingredient.price.toString());
      formData.set("unit", ingredient.unit);
      formData.set("weight", ingredient.weight.toString());
      submit(formData, { method: "put" });
    },
    [submit]
  );

  const deleteIngredient = useCallback(
    (ingredient: IIngredient) => {
      const formData = new FormData(formRef.current || undefined);
      formData.set("ingredientId", ingredient.id);
      submit(formData, { method: "delete" });
    },
    [submit]
  );

  useEffect(() => {
    const local = localStorage.getItem("receipts");
    local && setLocalReceipts(JSON.parse(local));
  }, [receiptName]);

  useEffect(() => {
    if (searchQuery.length) {
      setFilteredIngredients(
        ingredients.filter((i) =>
          i.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredIngredients(ingredients);
    }
  }, [searchQuery, ingredients]);

  return (
    <main className="overflow-y-none relative flex h-screen max-h-screen min-h-screen flex-col justify-center bg-white sm:mx-auto sm:w-4/5 xl:w-3/5">
      <div className="font-mono flex h-full w-full flex-1 flex-col gap-4">
        {/* Formed receipt */}
        <div className="flex h-1/2 flex-col gap-4 overflow-y-auto px-4">
          <div className="my-4 flex flex-wrap items-center gap-4">
            <span className="flex-1">
              Всего:{" "}
              <b>
                {Object.values(receipt)
                  .reduce(
                    (acc, curr) => acc + curr.price * (curr.count || 1),
                    0
                  )
                  .toFixed(2)}{" "}
              </b>
              грн
            </span>
            <span className="flex flex-wrap gap-4 md:flex-nowrap">
              <Input
                label="Создать рецепт"
                value={receiptName}
                onChange={(e) => setReceiptName(e.target.value)}
              />
              <Button
                color="green"
                disabled={!receiptName.length}
                onClick={() => {
                  // TODO: save to database, for now localStorage will do
                  localStorage.setItem(
                    "receipts",
                    JSON.stringify([
                      ...localReceipts,
                      {
                        receiptName: receiptName || "default",
                        receipt,
                      },
                    ])
                  );
                  alert("Рецепт сохранен локально!");
                  setReceiptName("");
                }}
              >
                Сохранить
              </Button>
              <Select
                label="Выбрать существующий"
                disabled={!localReceipts.length}
                onChange={(value) => {
                  const localReceipt = localReceipts.find(
                    (r) => r.receiptName === value
                  );
                  if (localReceipt) {
                    setReceipt(localReceipt.receipt);
                    setReceiptName(localReceipt.receiptName);
                  }
                }}
              >
                {localReceipts.map(({ receiptName }, i) => (
                  <Option key={`${receiptName}-${i}`} value={receiptName}>
                    {receiptName}
                  </Option>
                ))}
              </Select>
            </span>
          </div>
          {Object.entries(receipt).map(([key, ingredient], index) => (
            <Ingredient
              key={ingredient.id}
              onAdd={() =>
                setReceipt((prev) => ({
                  ...prev,
                  [ingredient.id]: {
                    ...ingredient,
                    count: (prev[ingredient.id]?.count || 0) + 1,
                  },
                }))
              }
              onDelete={() => setReceipt(({ [key]: _, ...rest }) => rest)}
              ingredient={mapCountedIngredient(ingredient)}
              index={index}
            />
          ))}
        </div>

        {/* Ingredients library */}
        <Form
          method="post"
          className="flex h-1/2 flex-col gap-4 overflow-y-auto border-t-4 border-gray-200 px-4"
          ref={formRef}
        >
          <div className="my-4 flex flex-wrap items-center gap-4">
            <span className="flex-1">Ингредиенты:</span>
            <span className="flex flex-1 gap-4">
              <Button
                color="green"
                onClick={() => {
                  setIsAdding(true);
                  setIsEditing(false);
                }}
              >
                Добавить
              </Button>
              <Input
                label="Поиск"
                icon={
                  <OutlinedIcons.XMarkIcon
                    className="h-5 w-5 cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  />
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </span>
          </div>
          {isAdding && (
            <AddIngredient
              editOverrides={undefined}
              onAdd={(newIngredient) => {
                addIngredient(newIngredient);
                setIsAdding(false);
              }}
            />
          )}
          {isEditing && (
            <AddIngredient
              editOverrides={editOverrides}
              onAdd={(newIngredient) => {
                editIngredient({ ...newIngredient, id: editOverrides!.id });
                setIsEditing(false);
              }}
            />
          )}
          {filteredIngredients.map((ingredient, index) => (
            <Ingredient
              key={ingredient.id}
              onAdd={() =>
                setReceipt((prev) => ({
                  ...prev,
                  [ingredient.id]: {
                    ...ingredient,
                    count: (prev[ingredient.id]?.count || 0) + 1,
                  },
                }))
              }
              onEdit={() => {
                setIsEditing(true);
                setIsAdding(false);
                setEditOverrides(ingredient);
              }}
              onDelete={() => deleteIngredient(ingredient)}
              ingredient={ingredient}
              index={index}
            />
          ))}
        </Form>
      </div>
    </main>
  );
}
