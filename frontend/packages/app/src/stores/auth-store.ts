import { createStore } from '@tanstack/react-store';
import { readFragment, type ResultOf } from 'gql.tada';

import { graphql } from '#/lib/graphql.ts';
import { queryStore } from './query-store';
import { sessionStore } from './session-store';

const meFragment = graphql(`
  fragment Me on Me {
    id
    email
    firstName
    lastName
    admin
  }
`);

type Me = ResultOf<typeof meFragment>;

export const authStore = createStore(
  {
    me: null as Me | null,
    initialized: false,
  },
  ({ setState, get }) => ({
    isAuthenticated() {
      return !!get().me;
    },
    isAdmin() {
      return !!get().me?.admin;
    },
    async initialize() {
      const state = get();
      if (state.initialized) return;

      if (await sessionStore.actions.refresh()) {
        await this.fetchMe();
      }

      setState((state) => ({ ...state, initialized: true }));
    },
    async fetchMe() {
      const query = graphql(
        `
          query Me {
            me {
              ...Me
            }
          }
        `,
        [meFragment],
      );

      const data = await queryStore.actions.execute(query);
      const me = readFragment(meFragment, data.me);

      setState((state) => ({
        ...state,
        me,
        initialized: true,
      }));
    },
  }),
);
