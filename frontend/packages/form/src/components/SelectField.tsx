import {
  Field,
  FieldLabel,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tiko/core';
import { useEffect, type ReactNode } from 'react';

import { useFieldContext } from '#/hooks/use-form.ts';

export interface SelectFieldOption {
  value: string;
  label: ReactNode;
}

interface SelectFieldProps {
  label?: string;
  placeholder?: string;
  options: SelectFieldOption[];
  disabled?: boolean;
}

export function SelectField(props: SelectFieldProps) {
  const field = useFieldContext<string>();

  useEffect(() => {
    if (
      props.options.length === 1 &&
      field.state.value !== props.options[0].value
    ) {
      field.handleChange(props.options[0].value);
    }
  }, [props.options, field, field.state.value]);

  return (
    <Field>
      {props.label && (
        <FieldLabel htmlFor={field.name}>{props.label}</FieldLabel>
      )}

      <Select
        value={field.state.value || null}
        onValueChange={(value) => field.handleChange(value ?? '')}
        disabled={props.disabled}
      >
        <SelectTrigger id={field.name}>
          <SelectValue placeholder={props.placeholder}>
            {(value: string) =>
              props.options.find((option) => option.value === value)?.label
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {props.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
