import { IconButton, Typography } from "@material-tailwind/react";
import type { ICountableIngredient } from "~/routes";
import * as OutlinedIcons from "@heroicons/react/24/outline";

export interface IngredientProps {
  ingredient: ICountableIngredient;
  index: number;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const Ingredient: React.FC<IngredientProps> = ({
  ingredient: { id, name, weight, price, unit },
  index,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <span className="flex-1">
        <Typography>
          {index + 1}. {name}
        </Typography>
      </span>
      <span className="flex-1">
        <Typography>
          {price.toFixed(2)} грн ({weight} {unit})
        </Typography>
      </span>
      <span className="flex justify-end gap-2">
        {onAdd && (
          <IconButton color="green" onClick={onAdd}>
            <OutlinedIcons.PlusCircleIcon className="h-6 w-6 text-white" />
          </IconButton>
        )}
        {onEdit && (
          <IconButton color="blue" onClick={onEdit}>
            <OutlinedIcons.PencilSquareIcon className="h-6 w-6" />
          </IconButton>
        )}
        {onDelete && (
          <IconButton color="red" onClick={onDelete}>
            <OutlinedIcons.TrashIcon className="h-6 w-6" />
          </IconButton>
        )}
      </span>
    </div>
  );
};
