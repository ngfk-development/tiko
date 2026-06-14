import { FieldGroup } from '@tiko/core';
import { useForm } from '@tiko/form';

import { useMessages } from '#/hooks/use-messages.ts';

export interface CustomFieldFormValues {
  name: string;
  icon: string;
  description: string;
  required: boolean;
}

export interface CustomFieldFormProps {
  formId: string;
  defaultValues?: CustomFieldFormValues;
  onSubmit: (values: CustomFieldFormValues) => void;
}

export function CustomFieldForm(props: CustomFieldFormProps) {
  const m = useMessages();

  const form = useForm({
    defaultValues: props.defaultValues ?? {
      name: '',
      icon: 'tag',
      description: '',
      required: false,
    },
    onSubmit({ value }) {
      props.onSubmit(value);
    },
  });

  return (
    <form
      id={props.formId}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.AppField
          name="icon"
          children={(field) => (
            <field.IconPickerField label={m.settings.fields.icon} />
          )}
        />

        <form.AppField
          name="name"
          children={(field) => <field.InputField label={m.general.name} />}
        />

        <form.AppField
          name="description"
          children={(field) => (
            <field.InputField label={m.settings.fields.description} />
          )}
        />

        <form.AppField
          name="required"
          children={(field) => (
            <field.SwitchField
              label={m.settings.fields.required}
              description={m.settings.fields.requiredDescription}
            />
          )}
        />
      </FieldGroup>
    </form>
  );
}
