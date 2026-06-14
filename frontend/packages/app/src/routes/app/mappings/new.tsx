import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  Button,
  FieldGroup,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@tiko/core';
import { useForm } from '@tiko/form';
import { XIcon } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { useState } from 'react';

import { useMessages } from '#/hooks/use-messages.ts';
import { useCustomFieldsQuery } from '#/queries/custom-fields.ts';
import {
  entityFieldsQueryOptions,
  useEntityFieldsQuery,
  type EntityFieldsRow,
  type FieldRow,
} from '#/queries/entity-fields.ts';
import { useConnectedIntegrationsQuery } from '#/queries/integrations.ts';
import {
  useCreateSyncMappingMutation,
  type CreateSyncMappingInput,
} from '#/queries/sync-mappings.ts';

export const Route = createFileRoute('/app/mappings/new')({
  component: RouteComponent,
});

function CustomFieldLabel(props: { icon: string; name: string }) {
  return (
    <span className="flex items-center gap-2">
      <DynamicIcon name={props.icon as IconName} className="size-4 shrink-0" />
      {props.name}
    </span>
  );
}

type MappingFormValues = {
  integrationId: string;
  trigger: string;
  entity: string;
  startedAtTemplate: string;
  startedAtFormat: string;
  endedAtTemplate: string;
  endedAtFormat: string;
  description: string;
  billable: string;
  customFieldLinks: {
    customFieldId: string;
    entity: string;
    externalIdField: string;
  }[];
  customFieldId: string;
  label: string;
  key: string;
  metadata: { key: string; template: string }[];
};

function useMappingForm(props: {
  onSubmitValues: (value: MappingFormValues) => void | Promise<void>;
}) {
  return useForm({
    defaultValues: {
      integrationId: '',
      trigger: 'automatic',
      entity: '',
      startedAtTemplate: '',
      startedAtFormat: '',
      endedAtTemplate: '',
      endedAtFormat: '',
      description: '',
      billable: '',
      customFieldLinks: [] as {
        customFieldId: string;
        entity: string;
        externalIdField: string;
      }[],
      customFieldId: '',
      label: '',
      key: '',
      metadata: [] as { key: string; template: string }[],
    },
    onSubmit: ({ value }) => props.onSubmitValues(value),
  });
}

function RouteComponent() {
  const m = useMessages();
  const { data: integrationsData } = useConnectedIntegrationsQuery();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const createMapping = useCreateSyncMappingMutation();

  const form = useMappingForm({
    onSubmitValues: async (value) => {
      const integration = integrationsData?.integrations.find(
        (i) => i.id === value.integrationId,
      );
      if (!integration) return;

      const entityFields = await queryClient.ensureQueryData(
        entityFieldsQueryOptions(integration.provider),
      );
      const isTimeEntry = entityFields.entityFields.find(
        (ef) => ef.entity === value.entity,
      )?.isTimeEntry;

      const hasEndedAt = value.endedAtTemplate && value.endedAtFormat;

      const input: CreateSyncMappingInput = {
        integrationId: value.integrationId,
        entity: value.entity as never,
        trigger: value.trigger as never,
        timeEntryRead: isTimeEntry
          ? {
              startedAt: {
                template: value.startedAtTemplate,
                format: value.startedAtFormat,
              },
              endedAt: hasEndedAt
                ? {
                    template: value.endedAtTemplate,
                    format: value.endedAtFormat,
                  }
                : null,
              description: value.description || null,
              billable: value.billable || null,
              customFieldLinks: value.customFieldLinks as never,
            }
          : null,
        customFieldRead: isTimeEntry
          ? null
          : {
              customFieldId: value.customFieldId,
              label: value.label || null,
              key: value.key || null,
              metadata: value.metadata,
            },
      };

      try {
        await createMapping.mutateAsync(input);
        navigate({ to: '/app/mappings' });
      } catch {
        toast.add({
          title: m.mappings.form.createErrorTitle,
          description: m.general.errors.somethingWentWrong,
        });
      }
    },
  });

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-lg font-medium">{m.general.newMapping}</h1>
        <p className="text-muted-foreground text-sm">
          {m.mappings.form.subtitle}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-5"
      >
        <FieldGroup>
          <form.AppField
            name="integrationId"
            children={(field) => (
              <field.SelectField
                label={m.mappings.form.integration}
                placeholder={m.mappings.form.integrationPlaceholder}
                options={(integrationsData?.integrations ?? []).map((i) => ({
                  value: i.id,
                  label:
                    m.integrations.providers[i.provider]?.label ?? i.provider,
                }))}
              />
            )}
          />

          <form.AppField
            name="trigger"
            children={(field) => (
              <field.SelectField
                label={m.mappings.form.trigger}
                options={[
                  { value: 'automatic', label: m.mappings.trigger.automatic },
                  { value: 'cron', label: m.mappings.trigger.cron },
                  { value: 'manual', label: m.mappings.trigger.manual },
                ]}
              />
            )}
          />

          <form.Subscribe
            selector={(state) => state.values.integrationId}
            children={(integrationId) => {
              const provider = integrationsData?.integrations.find(
                (i) => i.id === integrationId,
              )?.provider;

              return <EntitySection provider={provider} form={form} />;
            }}
          />
        </FieldGroup>

        <Button
          type="submit"
          className="self-start"
          disabled={!integrationsData?.integrations.length}
        >
          {m.mappings.form.create}
        </Button>
      </form>
    </div>
  );
}

function EntitySection(props: {
  provider: string | undefined;
  form: ReturnType<typeof useMappingForm>;
}) {
  const m = useMessages();
  const { provider, form } = props;
  const { data } = useEntityFieldsQuery(provider as never);

  return (
    <>
      <form.AppField
        name="entity"
        children={(field) => (
          <field.SelectField
            label={m.mappings.form.entity}
            placeholder={m.mappings.form.entityPlaceholder}
            disabled={!provider}
            options={(data?.entityFields ?? []).map((ef) => ({
              value: ef.entity,
              label: m.mappings.entities[ef.entity],
            }))}
          />
        )}
      />

      <form.Subscribe
        selector={(state) => state.values.entity}
        children={(entity) => {
          const entityFields = data?.entityFields.find(
            (ef) => ef.entity === entity,
          );

          if (!entityFields) return null;

          return entityFields.isTimeEntry ? (
            <TimeEntrySection
              form={form}
              fields={entityFields.fields}
              allEntities={data?.entityFields ?? []}
              currentEntity={entity}
            />
          ) : (
            <CustomFieldSection form={form} />
          );
        }}
      />
    </>
  );
}

function TimeEntrySection(props: {
  form: ReturnType<typeof useMappingForm>;
  fields: FieldRow[];
  allEntities: EntityFieldsRow[];
  currentEntity: string;
}) {
  const m = useMessages();
  const { form, fields, allEntities, currentEntity } = props;
  const { data: customFields } = useCustomFieldsQuery();

  const linkableEntities = allEntities.filter(
    (e) => e.entity !== currentEntity,
  );

  return (
    <div className="flex flex-col gap-4 rounded-md border p-4">
      <form.AppField
        name="startedAtTemplate"
        children={(field) => (
          <field.InputField
            label={m.mappings.form.startedAt}
            placeholder={m.mappings.form.startedAtTemplatePlaceholder}
          />
        )}
      />
      <form.AppField
        name="startedAtFormat"
        children={(field) => (
          <field.InputField
            label={m.mappings.form.format}
            placeholder={m.mappings.form.startedAtFormatPlaceholder}
          />
        )}
      />

      <form.AppField
        name="endedAtTemplate"
        children={(field) => (
          <field.InputField
            label={m.mappings.form.endedAt}
            placeholder={m.mappings.form.startedAtTemplatePlaceholder}
          />
        )}
      />
      <form.AppField
        name="endedAtFormat"
        children={(field) => (
          <field.InputField
            label={m.mappings.form.format}
            placeholder={m.mappings.form.startedAtFormatPlaceholder}
          />
        )}
      />

      <form.AppField
        name="description"
        children={(field) => (
          <field.InputField
            label={m.mappings.form.description}
            placeholder={m.mappings.form.descriptionPlaceholder}
          />
        )}
      />

      <form.AppField
        name="billable"
        children={(field) => (
          <field.SelectField
            label={m.mappings.form.billable}
            placeholder={m.mappings.form.billablePlaceholder}
            options={[
              { value: '', label: m.mappings.form.noOption },
              ...fields.map((f) => ({
                value: f.key,
                label: `${f.key} (${f.example})`,
              })),
            ]}
          />
        )}
      />

      <form.AppField
        name="customFieldLinks"
        mode="array"
        children={(field) => (
          <CustomFieldLinksList
            field={field}
            customFields={customFields}
            linkableEntities={linkableEntities}
            currentFields={fields}
            m={m}
          />
        )}
      />
    </div>
  );
}

function CustomFieldLinksList(props: {
  field: {
    state: {
      value: {
        customFieldId: string;
        entity: string;
        externalIdField: string;
      }[];
    };
    pushValue: (value: {
      customFieldId: string;
      entity: string;
      externalIdField: string;
    }) => void;
    removeValue: (index: number) => void;
  };
  customFields: { id: string; name: string; icon: string }[];
  linkableEntities: EntityFieldsRow[];
  currentFields: FieldRow[];
  m: ReturnType<typeof useMessages>;
}) {
  const { field, customFields, linkableEntities, currentFields, m } = props;
  const [pendingCustomFieldId, setPendingCustomFieldId] = useState('');
  const [pendingEntity, setPendingEntity] = useState('');
  const [pendingExternalIdField, setPendingExternalIdField] = useState('');

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">
        {m.mappings.form.customFieldLinksTitle}
      </p>

      {field.state.value.length > 0 && (
        <div className="flex flex-col divide-y rounded-md border">
          {field.state.value.map((link, index) => {
            const customField = customFields.find(
              (cf) => cf.id === link.customFieldId,
            );

            return (
              <div
                key={index}
                className="flex items-center justify-between gap-2 p-2 text-sm"
              >
                <span>
                  {customField ? (
                    <CustomFieldLabel
                      icon={customField.icon}
                      name={customField.name}
                    />
                  ) : (
                    link.customFieldId
                  )}
                </span>
                <span className="text-muted-foreground flex-1 text-right">
                  {m.mappings.entities[link.entity as never]}.
                  {link.externalIdField}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => field.removeValue(index)}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Select
          value={pendingCustomFieldId || null}
          onValueChange={(value) => setPendingCustomFieldId(value ?? '')}
        >
          <SelectTrigger className="flex-1">
            <SelectValue
              placeholder={m.mappings.form.linkCustomFieldPlaceholder}
            >
              {(value: string) => {
                const cf = customFields.find((cf) => cf.id === value);
                return cf && <CustomFieldLabel icon={cf.icon} name={cf.name} />;
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {customFields.map((cf) => (
                <SelectItem key={cf.id} value={cf.id}>
                  <CustomFieldLabel icon={cf.icon} name={cf.name} />
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={pendingEntity || null}
          onValueChange={(value) => setPendingEntity(value ?? '')}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={m.mappings.form.linkEntityPlaceholder}>
              {(value: string) => m.mappings.entities[value as never]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {linkableEntities.map((e) => (
                <SelectItem key={e.entity} value={e.entity}>
                  {m.mappings.entities[e.entity]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={pendingExternalIdField || null}
          onValueChange={(value) => setPendingExternalIdField(value ?? '')}
        >
          <SelectTrigger className="flex-1">
            <SelectValue
              placeholder={m.mappings.form.linkExternalIdFieldPlaceholder}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {currentFields.map((f) => (
                <SelectItem key={f.key} value={f.key}>
                  {f.key}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          type="button"
          size="sm"
          disabled={
            !pendingCustomFieldId || !pendingEntity || !pendingExternalIdField
          }
          onClick={() => {
            field.pushValue({
              customFieldId: pendingCustomFieldId,
              entity: pendingEntity,
              externalIdField: pendingExternalIdField,
            });
            setPendingCustomFieldId('');
            setPendingEntity('');
            setPendingExternalIdField('');
          }}
        >
          {m.mappings.form.addLink}
        </Button>
      </div>
    </div>
  );
}

function CustomFieldSection(props: {
  form: ReturnType<typeof useMappingForm>;
}) {
  const m = useMessages();
  const { form } = props;
  const { data: customFields } = useCustomFieldsQuery();

  return (
    <div className="flex flex-col gap-4 rounded-md border p-4">
      <form.AppField
        name="customFieldId"
        children={(field) => (
          <field.SelectField
            label={m.mappings.form.customField}
            placeholder={m.mappings.form.customFieldPlaceholder}
            options={customFields.map((cf) => ({
              value: cf.id,
              label: <CustomFieldLabel icon={cf.icon} name={cf.name} />,
            }))}
          />
        )}
      />

      <form.AppField
        name="label"
        children={(field) => (
          <field.InputField
            label={m.mappings.form.label}
            placeholder={m.mappings.form.labelPlaceholder}
          />
        )}
      />

      <form.AppField
        name="key"
        children={(field) => (
          <field.InputField
            label={m.mappings.form.key}
            placeholder={m.mappings.form.keyPlaceholder}
          />
        )}
      />

      <form.AppField
        name="metadata"
        mode="array"
        children={(field) => <MetadataList field={field} m={m} />}
      />
    </div>
  );
}

function MetadataList(props: {
  field: {
    state: { value: { key: string; template: string }[] };
    pushValue: (value: { key: string; template: string }) => void;
    removeValue: (index: number) => void;
  };
  m: ReturnType<typeof useMessages>;
}) {
  const { field, m } = props;
  const [pendingKey, setPendingKey] = useState('');
  const [pendingTemplate, setPendingTemplate] = useState('');

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">{m.mappings.form.metadataTitle}</p>

      {field.state.value.length > 0 && (
        <div className="flex flex-col divide-y rounded-md border">
          {field.state.value.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-2 p-2 text-sm"
            >
              <span>{entry.key}</span>
              <span className="text-muted-foreground flex-1 text-right">
                {entry.template}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => field.removeValue(index)}
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={pendingKey}
          onChange={(e) => setPendingKey(e.target.value)}
          placeholder={m.mappings.form.metadataKeyPlaceholder}
          className="flex-1"
        />
        <Input
          value={pendingTemplate}
          onChange={(e) => setPendingTemplate(e.target.value)}
          placeholder={m.mappings.form.metadataTemplatePlaceholder}
          className="flex-1"
        />
        <Button
          type="button"
          size="sm"
          disabled={!pendingKey || !pendingTemplate}
          onClick={() => {
            field.pushValue({ key: pendingKey, template: pendingTemplate });
            setPendingKey('');
            setPendingTemplate('');
          }}
        >
          {m.mappings.form.addMetadata}
        </Button>
      </div>
    </div>
  );
}
