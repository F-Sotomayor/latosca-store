import type {Option} from "~/product/types";

import type {CartItem} from "../types";
import type {ComponentProps} from "react";

import {useState, useMemo, useEffect} from "react";
import {X} from "lucide-react";

import {parseCurrency} from "~/currency/utils";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetClose,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

import {getCartItemPrice} from "../utils";

function CartItemDrawer({
  item,
  onClose,
  onSubmit,
  ...props
}: ComponentProps<typeof Sheet> & {
  item: CartItem;
  onClose: VoidFunction;
  onSubmit: (item: CartItem) => void;
}) {
  const [formData, setFormData] = useState<CartItem>(() => ({
    ...item,
    options: item.options
      ? Object.fromEntries(
          Object.entries(item.options).map(([category, options]) => [
            category,
            options.map((option) => ({
              ...option,
              quantity: 1, // Set initial quantity to 1
            })),
          ]),
        )
      : {},
  }));
  const total = useMemo(() => parseCurrency(getCartItemPrice(formData)), [formData]);

  const options = useMemo(
    () =>
      item.options
        ? Object.entries(item.options).map(([title, _options]) => ({
            title,
            options: _options,
          }))
        : [],
    [item],
  );

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      options: {
        ...(prevFormData.options || {}),
        [item.category]: prevFormData.options?.[item.category] || [{...item, quantity: 1}],
      },
    }));
  }, [item]);

  function handleAddToCart(option: Option) {
    setFormData((prevFormData) => {
      const {options} = prevFormData;
      const category = option.category;
      const existingOptions = options?.[category] ? [...options[category]] : [];
      const existingOptionIndex = existingOptions.findIndex((opt) => opt.title === option.title);

      // Calculate the current total quantity
      const currentTotalQuantity = Object.values(prevFormData.options ?? {}).reduce(
        (totalQuantity, optionsArray) =>
          totalQuantity + optionsArray.reduce((sum, opt) => sum + (opt.quantity || 0), 0),
        0,
      );

      // If formData.multiple is true and current total quantity is equal to or greater than minimum, do not add more
      if (prevFormData.multiple && currentTotalQuantity >= prevFormData.minimum) {
        return prevFormData;
      }

      // If the option already exists, update its quantity
      if (existingOptionIndex !== -1) {
        existingOptions[existingOptionIndex] = {
          ...existingOptions[existingOptionIndex],
          quantity: (existingOptions[existingOptionIndex].quantity || 0) + 1,
        };
      } else {
        // If the option doesn't exist, add it with quantity 1
        existingOptions.push({...option, quantity: 1});
      }

      const updatedOptions = {...options, [category]: existingOptions};

      return {...prevFormData, options: updatedOptions};
    });
  }

  function handleRemoveFromCart(option: Option) {
    setFormData((prevFormData) => {
      const {options} = prevFormData;
      const category = option.category;
      const existingOptions = options?.[category] ? [...options[category]] : [];
      const existingOptionIndex = existingOptions.findIndex((opt) => opt.title === option.title);

      // If the option exists and its quantity is 1, do not decrement the quantity
      if (existingOptionIndex !== -1 && existingOptions[existingOptionIndex].quantity === 1) {
        return prevFormData;
      }

      // If the option exists and its quantity is greater than 1, decrement its quantity
      if (existingOptionIndex !== -1) {
        existingOptions[existingOptionIndex] = {
          ...existingOptions[existingOptionIndex],
          quantity: existingOptions[existingOptionIndex].quantity - 1,
        };
      }

      const updatedOptions = {...options, [category]: existingOptions};

      return {...prevFormData, options: updatedOptions};
    });
  }

  function getQuantity(option: Option) {
    const selectedOptions = formData.options?.[option.category] || [];

    const selectedOption = selectedOptions.find((opt) => opt.title === option.title);

    return selectedOption ? selectedOption.quantity : 0;
  }

  function handleSelectOption(option: Option) {
    setFormData((_formData) => ({
      ..._formData,
      options: {..._formData.options, [option.category]: [option]},
    }));
  }

  return (
    <Sheet onOpenChange={(isOpen) => !isOpen && onClose()} {...props}>
      <SheetContent className="grid grid-rows-[auto_1fr_auto]">
        <SheetHeader>
          <SheetClose className="z-20 -mx-6 ml-auto h-12 w-14 rounded-l-lg border border-border bg-background py-2 pl-2 pr-4 shadow-lg">
            <X className="h-8 w-8" />
          </SheetClose>
        </SheetHeader>

        <div
          className={cn("overflow-y-auto", {"-mt-16": item.image})}
          data-testid="cart-item-drawer"
        >
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              {Boolean(item.image) && (
                <img
                  alt={item.title}
                  className="h-[240px] w-full bg-secondary object-cover sm:h-[320px]"
                  src={item.image}
                />
              )}
              <SheetTitle className="text-2xl font-medium">{item.title}</SheetTitle>
              <SheetDescription className="text-md whitespace-pre-wrap text-muted-foreground sm:text-lg">
                {item.description}
              </SheetDescription>
            </div>
            {Boolean(options.length) && (
              <div className="flex flex-col gap-8">
                {options.map((category) => (
                  <div key={category.title} className="flex w-full flex-col gap-4">
                    <p className="text-lg font-medium">{category.title}</p>
                    {category.title === "Promociones" ? (
                      <div className="flex flex-col gap-4">
                        {category.options.map((option) => (
                          <div key={option.title} className="flex items-center gap-x-3 p-2">
                            <Label className="w-full" htmlFor={option.title}>
                              <div className="flex w-full items-center justify-between gap-2">
                                <p>{option.title}</p>
                                <div className="flex items-center justify-center gap-4">
                                  <Button onClick={() => handleRemoveFromCart(option)}>-</Button>
                                  <div>{getQuantity(option)}</div>
                                  <Button onClick={() => handleAddToCart(option)}>+</Button>
                                </div>
                                {Boolean(option.price) && (
                                  <div className="flex items-center gap-1">
                                    <p className="text-muted-foreground">
                                      {option.price < 0 ? "-" : "+"}
                                    </p>
                                    <p className="font-medium">
                                      {parseCurrency(Math.abs(option.price))}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <RadioGroup value={formData.options?.[category.title]?.[0]?.title}>
                        <div className="flex flex-col gap-4">
                          {category.options.map((option) => (
                            <div key={option.title} className="flex items-center gap-x-3">
                              <RadioGroupItem
                                id={option.title}
                                value={option.title}
                                onClick={() => {
                                  handleSelectOption(option);
                                }}
                              />
                              <Label className="w-full" htmlFor={option.title}>
                                <div className="flex w-full items-center justify-between gap-2">
                                  <p>{option.title}</p>
                                  {Boolean(option.price) && (
                                    <div className="flex items-center gap-1">
                                      <p className="text-muted-foreground">
                                        {option.price < 0 ? "-" : "+"}
                                      </p>
                                      <p className="font-medium">
                                        {parseCurrency(Math.abs(option.price))}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <SheetFooter>
          <div className="flex w-full flex-col gap-4">
            <hr />
            <div className="flex items-center justify-between text-lg font-medium">
              {!Boolean(formData.multiple) && (
                <div className="flex items-center justify-center gap-4">
                  <Button onClick={() => handleRemoveFromCart(formData)}>-</Button>
                  <div>{getQuantity(formData)}</div>
                  <Button onClick={() => handleAddToCart(formData)}>+</Button>
                </div>
              )}
              <div className="flex gap-4">
                <p>Total: </p>
                <p>
                  {Object.values(formData.options ?? {}).reduce(
                    (totalQuantity, optionsArray) =>
                      totalQuantity +
                      optionsArray.reduce((sum, option) => sum + (option.quantity || 0), 0),
                    0,
                  ) === 0
                    ? parseCurrency(formData.price)
                    : total}
                </p>
              </div>
            </div>
            <Button
              className="w-full"
              disabled={
                formData.multiple
                  ? formData.options?.Promociones
                    ? formData.options.Promociones.reduce(
                        (totalQuantity, option) => totalQuantity + (option.quantity || 0),
                        0,
                      ) !== formData.minimum
                    : true
                  : formData.options
                    ? Object.values(formData.options).reduce(
                        (totalQuantity, optionsArray) =>
                          totalQuantity +
                          optionsArray.reduce((sum, option) => sum + (option.quantity || 0), 0),
                        0,
                      ) === 0
                    : true
              }
              size="lg"
              variant="brand"
              onClick={() => {
                onSubmit(formData);
              }}
            >
              Agregar al pedido
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default CartItemDrawer;
