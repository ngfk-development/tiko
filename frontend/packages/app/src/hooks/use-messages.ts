import { useSelector } from '@tanstack/react-store';

import { localeStore } from '#/stores/locale-store.ts';

export function useMessages() {
  return useSelector(localeStore, (state) => state.messages);
}
