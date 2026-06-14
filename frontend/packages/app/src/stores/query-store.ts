import { createStore } from '@tanstack/react-store';
import type { ResultOf, TadaDocumentNode, VariablesOf } from 'gql.tada';
import { print, type GraphQLFormattedError } from 'graphql';

import { request } from '#/lib/api/request.ts';
import { GraphQLRequestError } from '#/lib/graphql.ts';
import { sessionStore } from '#/stores/session-store.ts';

type Query = TadaDocumentNode<any, any, any>;

interface QueryOptions<T extends Query> {
  autoRefresh?: boolean;
  batch?: boolean;
  operationName?: string;
  variables?: VariablesOf<T>;
}

interface QueryExecution<T extends Query = Query> {
  query: T;
  operationName: string;
  options: QueryOptions<T>;
  resolve: (value: ResultOf<T>) => void;
  reject: (error: Error) => void;
}

interface QueryResult<T extends Query = Query> {
  data: ResultOf<T>;
  errors?: GraphQLFormattedError[];
}

export const queryStore = createStore(
  {
    batch: [] as QueryExecution[],
    timeout: null as number | null,
  },
  ({ get, setState }) => ({
    async execute<T extends Query>(
      query: T,
      options: QueryOptions<T> = {},
    ): Promise<ResultOf<T>> {
      return new Promise<ResultOf<T>>((resolve, reject) => {
        const operationName =
          options.operationName ??
          query.definitions.find((d) => d.kind === 'OperationDefinition')?.name
            ?.value ??
          '';

        const execution: QueryExecution<T> = {
          query,
          operationName,
          options,
          resolve,
          reject,
        };

        const autoRefresh = options.autoRefresh ?? true;
        if (options.batch === false)
          return this.executeSingle(execution, autoRefresh);

        const state = get();
        if (state.timeout !== null) clearTimeout(state.timeout);

        const timeout = setTimeout(() => {
          const { batch } = get();

          setState(() => ({
            batch: [],
            timeout: null,
          }));

          return batch.length === 1
            ? this.executeSingle(batch[0], autoRefresh)
            : this.executeBatch(batch, autoRefresh);
        }, 0);

        setState((state) => ({
          batch: [...state.batch, execution],
          timeout,
        }));
      });
    },

    async executeBatch(batch: QueryExecution[], autoRefresh: boolean) {
      const { refresh } = sessionStore.actions;

      try {
        const name = batch.map((b) => b.operationName).join(',');

        const results = await request<QueryResult[]>(`/graphql?q=${name}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            batch.map((execution) => ({
              query: print(execution.query),
              operationName: execution.operationName,
              variables: execution.options.variables,
            })),
          ),
        });

        const authErrors: {
          execution: QueryExecution;
          error: GraphQLRequestError;
        }[] = [];

        for (let i = 0; i < batch.length; i += 1) {
          const execution = batch[i];
          const result = results[i];

          if (!result.errors?.length) {
            execution.resolve(result.data);
            continue;
          }

          const error = new GraphQLRequestError(result.errors);
          if (error.code !== 'UNAUTHENTICATED' || !autoRefresh) {
            execution.reject(error);
            continue;
          }

          authErrors.push({ execution, error });
        }

        if (!authErrors.length) return;

        if (await refresh()) {
          const batch = authErrors.map((e) => e.execution);

          return batch.length === 1
            ? this.executeSingle(batch[0], false)
            : this.executeBatch(batch, false);
        }

        for (const { execution, error } of authErrors) {
          execution.reject(error);
        }
      } catch (error) {
        for (let i = 0; i < batch.length; i += 1) {
          batch[i].reject(error as Error);
        }
      }
    },

    async executeSingle<T extends Query>(
      execution: QueryExecution<T>,
      autoRefresh: boolean,
    ) {
      const { refresh } = sessionStore.actions;
      const { query, operationName, options } = execution;

      try {
        const result = await request<QueryResult>(
          `/graphql?q=${operationName}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: print(query),
              operationName,
              variables: options.variables,
            }),
          },
        );

        if (!result.errors?.length) {
          execution.resolve(result.data);
          return;
        }

        const error = new GraphQLRequestError(result.errors);

        if (
          error.code === 'UNAUTHENTICATED' &&
          autoRefresh &&
          (await refresh())
        ) {
          return this.executeSingle(execution, false);
        }

        execution.reject(error);
      } catch (error) {
        execution.reject(error as Error);
      }
    },
  }),
);
