import { Input, Select, Option, Button } from "@material-tailwind/react";
import { useState } from "react";
import type { Ingredient } from "~/models/ingredient.server";
import type { UnitType } from "~/routes";

export interface AddIngredientProps {
  onAdd: (ingredient: Omit<Ingredient, "id">) => void;
  editOverrides?: Ingredient;
}

export const AddIngredient: React.FC<AddIngredientProps> = ({
  onAdd,
  editOverrides,
}) => {
  const [name, setName] = useState<string>(editOverrides?.name || "");
  const [unit, setUnit] = useState<UnitType>(
    (editOverrides?.unit as UnitType) || "г"
  );
  const [weight, setWeight] = useState<number>(editOverrides?.weight || 0);
  const [price, setPrice] = useState<number>(editOverrides?.price || 0);

  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-4">
      <span className="">
        <Input
          type="text"
          label="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </span>
      <span className="">
        <Select
          label="Единица"
          defaultValue="г"
          onChange={(value) => setUnit(value as UnitType)}
        >
          <Option value="г">г</Option>
          <Option value="шт">шт</Option>
        </Select>
      </span>
      <span className="">
        <Input
          type="number"
          label="Вес/кол-во"
          value={weight}
          onChange={(e) => setWeight(+e.target.value)}
        />
      </span>
      <span className="">
        <Input
          type="number"
          label="Цена"
          value={price}
          onChange={(e) => setPrice(+e.target.value)}
        />
      </span>
      <span className="">
        <Button
          color="green"
          disabled={!name.length || price === 0 || weight === 0 || !unit.length}
          onClick={() => onAdd({ name, unit, price, weight })}
        >
          Сохранить
        </Button>
      </span>
    </div>
  );
};
