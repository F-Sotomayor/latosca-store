import type {Cart, CartItem} from "../../types";

import React, {useState} from "react";
import {MinusIcon} from "lucide-react"; // Import Edit3Icon

import {parseCurrency} from "~/currency/utils";

import {Button} from "@/components/ui/button";
import Modal from "@/components/ui/EditModal";
import EditItemForm from "@/components/ui/EditItemForm";

import {getCartItemPrice, getCartItemOptionsSummary} from "../../utils";

function Details({cart, onChange}: {cart: Cart; onChange: (id: number, item: CartItem) => void}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

  const handleEditClick = (item: CartItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (updatedItem: CartItem) => {
    if (selectedItem) {
      const itemId = Array.from(cart.entries()).find(
        ([_, cartItem]) => cartItem === selectedItem,
      )?.[0];

      if (itemId) {
        onChange(itemId, {...selectedItem, ...updatedItem});
      }
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {Array.from(cart.entries()).map(([id, item]) => (
        <div key={id.toString()} className="flex gap-2" data-testid={`cart-item-${item.id}`}>
          {item.category !== "Promociones" && (
            <div className="mr-4 flex items-center gap-2">
              <Button
                className="text-md h-6 w-6 rounded-full p-0.5"
                data-testid="decrement"
                variant="destructive"
                onClick={() => {
                  onChange(id, {...item, quantity: item.quantity - 1});
                }}
              >
                <MinusIcon className="h-6 w-6" />
              </Button>
              <Button
                className="text-md h-6 w-6 rounded-full p-0.5"
                data-testid="edit"
                variant="outline"
                onClick={() => handleEditClick(item)}
              >
                <img alt="Editar" className="h-7 w-24 max-w-none" src="/assets/edit.png" />
              </Button>
            </div>
          )}
          <div className="flex w-full flex-col gap-1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col">
                <p className="text-lg font-medium">{item.title}</p>
                {Boolean(item.options) && (
                  <div className="text-muted-foreground">
                    {getCartItemOptionsSummary(item.options)
                      .split(",")
                      .map((option, index) => (
                        <div key={index}>{option}</div>
                      ))}
                  </div>
                )}
              </div>
              <p className="font-medium leading-[1.9rem]">
                {parseCurrency(getCartItemPrice(item))}
              </p>
            </div>
          </div>
        </div>
      ))}

      {isModalOpen && selectedItem ? (
        <Modal
          isOpen={isModalOpen}
          title={selectedItem.title}
          onClose={() => setIsModalOpen(false)}
        >
          <EditItemForm item={selectedItem} onSubmit={handleModalSubmit} />
        </Modal>
      ) : null}
    </div>
  );
}

export default Details;
