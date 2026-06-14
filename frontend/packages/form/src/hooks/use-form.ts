import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { IconPickerField } from '#/components/IconPickerField.tsx';
import { InputField } from '#/components/InputField.tsx';
import { SelectField } from '#/components/SelectField.tsx';
import { SwitchField } from '#/components/SwitchField.tsx';

export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

export const { useAppForm: useForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    InputField,
    SwitchField,
    IconPickerField,
    SelectField,
  },
  formComponents: {},
});
