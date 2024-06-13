import type {CartItem} from "@/modules/cart/types"; // Adjust import based on your actual types
import type {Option} from "@/modules/product/types";

import React, {useState} from "react";
import {MinusIcon, PlusIcon} from "lucide-react"; // Import icons

import {Button} from "@/components/ui/button";

interface EditItemFormProps {
  item: CartItem;
  onSubmit: (updatedItem: CartItem) => void;
}

function EditItemForm({item, onSubmit}: EditItemFormProps) {
  const initialQuantity = item.options?.[item.category]?.[0]?.quantity || 1;
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleDecrease = () => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity - 1)); // Ensure quantity never goes below 1
  };

  const handleIncrease = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleSubmit = () => {
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    const updatedOption: Option | any = {
      ...item.options?.[item.category]?.[0], // Copy existing option or empty object
      quantity: quantity,
    };

    const updatedOptions: Record<string, Option[]> = {
      ...item.options,
      [item.category]: [updatedOption],
    };

    onSubmit({...item, options: updatedOptions}); // Pass updated options back to parent component
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          className="text-md h-6 w-6 rounded-full p-0.5"
          variant="destructive"
          onClick={handleDecrease}
        >
          <MinusIcon className="h-6 w-6" />
        </Button>
        <div>{quantity}</div>
        <Button
          className="text-md h-6 w-6 rounded-full p-0.5"
          variant="brand"
          onClick={handleIncrease}
        >
          <PlusIcon className="h-6 w-6" />
        </Button>
      </div>
      <Button className="w-full" onClick={handleSubmit}>
        Save Changes
      </Button>
    </div>
  );
}

export default EditItemForm;
