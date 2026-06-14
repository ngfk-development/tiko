import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Field,
  FieldLabel,
} from '@tiko/core';
import { TagIcon } from 'lucide-react';
import { DynamicIcon, iconNames, type IconName } from 'lucide-react/dynamic';
import { useMemo, useState } from 'react';

import { useFieldContext } from '#/hooks/use-form.ts';

const MAX_RESULTS = 50;

interface IconPickerFieldProps {
  label?: string;
}

export function IconPickerField(props: IconPickerFieldProps) {
  const field = useFieldContext<string>();
  const [query, setQuery] = useState('');

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? iconNames.filter((name) => name.includes(q))
      : iconNames;

    return matches.slice(0, MAX_RESULTS);
  }, [query]);

  return (
    <Field>
      {props.label && (
        <FieldLabel htmlFor={field.name}>{props.label}</FieldLabel>
      )}

      <div className="flex items-center gap-2">
        <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg border">
          <DynamicIcon
            name={(field.state.value || 'tag') as IconName}
            className="size-4"
            fallback={() => <TagIcon className="size-4" />}
          />
        </div>

        <div className="min-w-0 flex-1">
          <Combobox
            items={items}
            value={field.state.value}
            onValueChange={(value) => field.handleChange(value ?? 'tag')}
            onInputValueChange={setQuery}
          >
            <ComboboxInput
              id={field.name}
              placeholder="Search icons…"
              className="w-full"
            />
            <ComboboxContent>
              <ComboboxEmpty>No icons found.</ComboboxEmpty>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
    </Field>
  );
}
