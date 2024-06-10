import type {Cart, CartItem, Checkout} from "./types";

import {parseCurrency} from "~/currency/utils";

export function getCartItemPrice(item: CartItem): number {
  if (item.multiple) return item.price;

  const optionsPrice = item.options
    ? Object.values(item.options).reduce((totalPrice, optionArray) => {
        return (
          totalPrice +
          optionArray.reduce((price, option) => {
            return price + option.price * option.quantity;
          }, 0)
        );
      }, 0)
    : 0;

  return optionsPrice;
}

export function getCartTotal(cart: Cart): number {
  return Array.from(cart.values()).reduce((total, item) => total + getCartItemPrice(item), 0);
}

export function getCartItemOptionsSummary(options: CartItem["options"]): string {
  return Object.entries(options!)
    .reduce<string[]>((_options, [_category, optionList]) => {
      const optionsSummary = optionList.map(
        (option) => `${option.title}: ${option.quantity || `$ ${option.price}`}`,
      );

      return _options.concat(optionsSummary);
    }, [])
    .join(", ");
}

export function getCartMessage(cart: Cart, checkout: Checkout): string {
  const items = Array.from(cart.values())
    .map((item) => {
      let optionsSummary = "";

      if (item.options && Object.keys(item.options).length > 0) {
        optionsSummary = `\n${getCartItemOptionsSummary(item.options).replace(/, /g, "\n ").replace(/: /g, ": ")}`;
      }

      return `* ${item.title}${optionsSummary}\n${parseCurrency(getCartItemPrice(item))}`;
    })
    .join("\n\n")
    .replace(/\n /g, "\n"); // Remove extra space at the beginning of each item

  const fields = Array.from(checkout.entries())
    .map(([key, value]) => `* ${key}: ${value}`)
    .join("\n");
  const total = `Total: ${parseCurrency(getCartTotal(cart))}`;

  return `${items}\n\n${fields}\n\n${total}`;
}
