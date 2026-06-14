import { initGraphQLTada } from 'gql.tada';
import type { GraphQLFormattedError } from 'graphql';

import type { introspection } from '#generated/graphql-env.d.ts';

export const graphql = initGraphQLTada<{
  introspection: introspection;
  scalars: {
    Boolean: boolean;
    DateTime: string;
    Int: number;
    JSON: any;
    String: string;
    UUID: string;
  };
}>();

export type GraphQLErrorCode =
  'UNAUTHENTICATED' | 'FORBIDDEN' | 'INVALID_CREDENTIALS' | 'BAD_USER_INPUT';

export class GraphQLRequestError extends Error {
  errors: GraphQLFormattedError[];

  constructor(errors: GraphQLFormattedError[]) {
    super(errors[0]?.message ?? 'GraphQL request failed');
    this.name = 'GraphQLRequestError';
    this.errors = errors;
  }

  get code(): GraphQLErrorCode | undefined {
    return this.errors[0]?.extensions?.code as GraphQLErrorCode | undefined;
  }
}
