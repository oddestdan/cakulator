import { Input, Select, Option, Button } from "@material-tailwind/react";
import { useState } from "react";
import type { IIngredient, UnitType } from "~/routes";

export interface AddIngredientProps {
  onAdd: (ingredient: Omit<IIngredient, "id">) => void;
  editOverrides?: IIngredient;
  // TODO: pass override default values (for edit)
}

export const AddIngredient: React.FC<AddIngredientProps> = ({
  onAdd,
  editOverrides,
}) => {
  const [name, setName] = useState<string>(editOverrides?.name || "");
  const [units, setUnits] = useState<UnitType>(editOverrides?.units || "г");
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
          onChange={(value) => setUnits(value as UnitType)}
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
          disabled={
            !name.length || price === 0 || weight === 0 || !units.length
          }
          onClick={() => onAdd({ name, units, price, weight })}
        >
          Сохранить
        </Button>
      </span>
    </div>
  );
};
