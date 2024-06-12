import type {Checkout, Field} from "../../types";

import {useState} from "react";

import {Alert} from "@/components/ui/alert";
import {Input} from "@/components/ui/input";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";

function TextField({
  value,
  onChange,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "onChange"> & {
  onChange: (value: string) => void;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      {...props}
    />
  );
}

function RadioField({
  value,
  onChange,
  options,
}: {
  options: string[];
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <RadioGroup value={value} onValueChange={onChange}>
      <div className="flex flex-col gap-4">
        {options.map((option) => (
          <div key={option} className="flex items-center gap-x-3">
            <RadioGroupItem id={option} value={option}>
              {option}
            </RadioGroupItem>
            <Label htmlFor={option}>{option}</Label>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
}

function Fields({
  fields,
  checkout,
  onChange,
}: {
  fields: Field[];
  checkout: Checkout;
  onChange: (id: string, value: string) => void;
}) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  console.log(selectedValue);

  const handleChange = (id: string, value: string) => {
    onChange(id, value);

    // Track the selected value of the radio button
    if (fields.find((field) => field.title === id)?.type === "radio") {
      setSelectedValue(value);
    }
  };

  return (
    <div className="flex h-full flex-col gap-8">
      {fields.map((field) => (
        <div key={field.title} className="flex flex-col gap-4">
          {field.type === "radio" && (
            <div className="flex flex-col gap-4">
              <p className="text-lg font-medium">{field.title}</p>
              <RadioField
                options={field.options}
                value={checkout.get(field.title) || ""}
                onChange={(value: string) => {
                  handleChange(field.title, value);
                }}
              />
              {field.note ? <Alert>{field.note}</Alert> : null}
            </div>
          )}
          {field.type === "text" && selectedValue === "Delivery" && (
            <div className="flex flex-col gap-4">
              <p className="text-lg font-medium">{field.title}</p>
              <TextField
                placeholder={field.placeholder}
                value={checkout.get(field.title) || ""}
                onChange={(value: string) => {
                  handleChange(field.title, value);
                }}
              />
              {field.note ? <Alert>{field.note}</Alert> : null}
            </div>
          )}
        </div>
      ))}
      {selectedValue === "Delivery" && (
        <div className="mt-4 flex h-full flex-1 flex-col items-end justify-end pr-4">
          <p className="text-lg font-medium">Costo de Envio: $ 600</p>
          <p className="font-small text-">Si excede nuestro rango, se cobrara un adicional</p>
        </div>
      )}
    </div>
  );
}

export default Fields;
