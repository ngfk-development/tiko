import { Field, FieldLabel, Input } from '@tiko/core';
import type { ComponentProps } from 'react';

import { useFieldContext } from '#/hooks/use-form.ts';

interface InputFieldProps extends ComponentProps<'input'> {
  label?: string;
}

export function InputField(props: InputFieldProps) {
  const field = useFieldContext<
    string | readonly string[] | number | undefined
  >();

  return (
    <Field>
      {props.label && (
        <FieldLabel htmlFor={field.name}>{props.label}</FieldLabel>
      )}

      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        {...props}
      />
    </Field>
  );
}
