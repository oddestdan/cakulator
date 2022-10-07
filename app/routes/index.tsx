import { Button, Input, Option, Select } from "@material-tailwind/react";
import { useState } from "react";
import * as OutlinedIcons from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { Ingredient } from "~/components/Ingredient";
import { AddIngredient } from "~/components/AddIngredient";
import { mockIngredients } from "~/components/mock";

export type UnitType = "г" | "шт";

export interface IIngredient {
  id: number; // TODO: remove after db is migrated
  name: string;
  price: number;
  weight: number;
  units: UnitType;
}

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

export default function Index() {
  const [ingredients, setIngredients] =
    useState<IIngredient[]>(mockIngredients);
  const [filteredIngredients, setFilteredIngredients] =
    useState<IIngredient[]>(ingredients);
  const [receipt, setReceipt] = useState<
    Record<string | number, ICountableIngredient>
  >({});
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [receiptName, setReceiptName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [localReceipts, setLocalReceipts] = useState<any[]>([]);
  const [editOverrides, setEditOverrides] = useState<IIngredient | undefined>(
    undefined
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
          {Object.entries(receipt).map(([key, ingredient]) => (
            <Ingredient
              key={ingredient.id}
              onAdd={() =>
                setReceipt((prev) => ({
                  ...prev,
                  [ingredient.name]: {
                    ...ingredient,
                    count: (prev[ingredient.name]?.count || 0) + 1,
                  },
                }))
              }
              onDelete={() => setReceipt(({ [key]: _, ...rest }) => rest)}
              ingredient={mapCountedIngredient(ingredient)}
            />
          ))}
        </div>

        {/* Ingredients library */}
        <div className="flex h-1/2 flex-col gap-4 overflow-y-auto border-t-4 border-gray-200 px-4">
          <div className="my-4 flex flex-wrap items-center gap-4">
            <span className="flex-1">Ингредиенты:</span>
            <span className="flex flex-1 gap-4">
              <Button color="green" onClick={() => setIsAdding(true)}>
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
              editOverrides={editOverrides}
              onAdd={(newIngredient) => {
                setIngredients([
                  ...ingredients,
                  { ...newIngredient, id: ingredients.length + 1 },
                ]);
                setEditOverrides(undefined);
                setIsAdding(false);
              }}
            />
          )}
          {filteredIngredients.map((ingredient) => (
            <Ingredient
              key={ingredient.id}
              onAdd={() =>
                setReceipt((prev) => ({
                  ...prev,
                  [ingredient.name]: {
                    ...ingredient,
                    count: (prev[ingredient.name]?.count || 0) + 1,
                  },
                }))
              }
              onEdit={() => {
                setIsAdding(true);
                setEditOverrides(ingredient);
                setIngredients(
                  ingredients.filter((i) => i.id !== ingredient.id)
                );
              }}
              onDelete={() =>
                setIngredients(
                  ingredients.filter((i) => i.id !== ingredient.id)
                )
              }
              ingredient={ingredient}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
