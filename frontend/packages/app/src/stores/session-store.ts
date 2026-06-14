import { createStore } from '@tanstack/react-store';

import { graphql } from '#/lib/graphql.ts';
import { queryStore } from './query-store';

export interface Session {
  accessToken?: string;
}

export const sessionStore = createStore(
  { session: null as Session | null },
  ({ setState }) => ({
    async login(email: string, password: string) {
      try {
        const query = graphql(`
          mutation Login($email: String!, $password: String!) {
            auth: authLogin(email: $email, password: $password) {
              accessToken
            }
          }
        `);

        const data = await queryStore.actions.execute(query, {
          variables: {
            email: email,
            password: password,
          },
        });

        const session: Session = {
          accessToken: data.auth.accessToken,
        };

        setState((state) => ({ ...state, session: session }));
      } catch (e) {
        setState((state) => ({ ...state, session: null }));
        throw e;
      }
    },
    async logout() {
      const query = graphql(`
        mutation Logout {
          ok: authLogout
        }
      `);

      const data = await queryStore.actions.execute(query);
      if (data.ok) setState((state) => ({ ...state, session: null }));
    },
    async refresh(): Promise<boolean> {
      try {
        const query = graphql(`
          mutation Refresh {
            session: authRefresh {
              accessToken
            }
          }
        `);

        const data = await queryStore.actions.execute(query, {
          autoRefresh: false,
        });

        setState((state) => ({ ...state, session: data.session }));
        return true;
      } catch {
        return false;
      }
    },
  }),
);
