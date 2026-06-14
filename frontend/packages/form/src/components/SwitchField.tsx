import { Field, FieldDescription, FieldLabel, Switch } from '@tiko/core';

import { useFieldContext } from '#/hooks/use-form.ts';

interface SwitchFieldProps {
  label?: string;
  description?: string;
}

export function SwitchField(props: SwitchFieldProps) {
  const field = useFieldContext<boolean>();

  return (
    <Field>
      <div className="flex items-center justify-between gap-4">
        {props.label && (
          <FieldLabel htmlFor={field.name}>{props.label}</FieldLabel>
        )}
        <Switch
          id={field.name}
          checked={field.state.value}
          onCheckedChange={(checked) => field.handleChange(checked)}
        />
      </div>
      {props.description && (
        <FieldDescription>{props.description}</FieldDescription>
      )}
    </Field>
  );
}
