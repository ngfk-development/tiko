import { createFileRoute, Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@tiko/core';
import {
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { useEffect, useRef, useState } from 'react';

import {
  CustomFieldForm,
  type CustomFieldFormValues,
} from '#/components/forms/CustomFieldForm.tsx';
import { DataTable, DragHandle } from '#/components/ui/data-table2.tsx';
import { useMessages } from '#/hooks/use-messages.ts';
import { useCustomFieldsQuery } from '#/queries/custom-fields.ts';

export const Route = createFileRoute('/app/settings')({
  component: RouteComponent,
});

interface SettingsCustomField extends CustomFieldFormValues {
  id: string;
  active: boolean;
}

type DialogState =
  { mode: 'create' } | { mode: 'edit'; field: SettingsCustomField } | null;

const FORM_ID = 'custom-field-form';

function RouteComponent() {
  const m = useMessages();
  const { data: customFields } = useCustomFieldsQuery();

  // Local-only state for now — there's no create/update/delete/disable
  // mutation on the backend yet, so this is seeded from the real query
  // once, then mutated purely client-side (resets on reload).
  const [fields, setFields] = useState<SettingsCustomField[]>([]);
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current || customFields.length === 0) return;

    setFields(
      customFields.map((field) => ({
        id: field.id,
        name: field.name,
        icon: field.icon,
        description: field.description ?? '',
        required: false,
        active: true,
      })),
    );
    seeded.current = true;
  }, [customFields]);

  const [dialogState, setDialogState] = useState<DialogState>(null);

  function handleSubmit(values: CustomFieldFormValues) {
    if (dialogState?.mode === 'edit') {
      const id = dialogState.field.id;
      setFields((prev) =>
        prev.map((field) =>
          field.id === id ? { ...field, ...values } : field,
        ),
      );
    } else {
      setFields((prev) => [
        ...prev,
        { id: crypto.randomUUID(), active: true, ...values },
      ]);
    }
    setDialogState(null);
  }

  function toggleActive(id: string) {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, active: !field.active } : field,
      ),
    );
  }

  function remove(id: string) {
    setFields((prev) => prev.filter((field) => field.id !== id));
  }

  const columns: ColumnDef<SettingsCustomField>[] = [
    {
      id: 'drag',
      header: '',
      size: 40,
      cell: () => <DragHandle />,
    },
    {
      accessorKey: 'name',
      header: m.general.name,
      cell: ({ row }) => (
        <Link
          to="/app/fields/$id"
          params={{ id: row.original.id }}
          className="flex items-center gap-2 hover:underline"
        >
          <DynamicIcon
            name={row.original.icon as IconName}
            className="text-muted-foreground size-4 shrink-0"
          />
          <span
            className={
              row.original.active
                ? undefined
                : 'text-muted-foreground line-through'
            }
          >
            {row.original.name}
          </span>
        </Link>
      ),
    },
    {
      accessorKey: 'description',
      header: m.settings.fields.description,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.description || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'required',
      header: m.settings.fields.required,
      cell: ({ row }) =>
        row.original.required ? (
          <Badge variant="secondary">{m.settings.fields.required}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              setDialogState({ mode: 'edit', field: row.original })
            }
          >
            <PencilIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => toggleActive(row.original.id)}
          >
            {row.original.active ? <EyeOffIcon /> : <EyeIcon />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => remove(row.original.id)}
          >
            <Trash2Icon />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-medium">{m.general.settings}</h1>
        <p className="text-muted-foreground text-sm">{m.settings.subtitle}</p>
      </div>

      <div className="text-muted-foreground flex h-32 items-center justify-center rounded-md border border-dashed text-sm">
        {m.integrations.status.coming_soon}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-medium">{m.settings.fields.title}</h2>
            <p className="text-muted-foreground text-sm">
              {m.settings.fields.subtitle}
            </p>
          </div>

          <Button size="sm" onClick={() => setDialogState({ mode: 'create' })}>
            <PlusIcon />
            {m.settings.fields.add}
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={fields}
          getRowId={(field) => field.id}
          onReorder={setFields}
        />
      </div>

      <Dialog
        open={dialogState !== null}
        onOpenChange={(open) => !open && setDialogState(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState?.mode === 'edit'
                ? m.settings.fields.edit
                : m.settings.fields.add}
            </DialogTitle>
            <DialogDescription>{m.settings.fields.subtitle}</DialogDescription>
          </DialogHeader>

          <CustomFieldForm
            formId={FORM_ID}
            defaultValues={
              dialogState?.mode === 'edit' ? dialogState.field : undefined
            }
            onSubmit={handleSubmit}
          />

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {m.general.cancel}
            </DialogClose>
            <Button type="submit" form={FORM_ID}>
              {m.general.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
