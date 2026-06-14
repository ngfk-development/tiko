import { createStore } from '@tanstack/react-store';

interface TimerState {
  startedAt: Date | null;
}

export const timerStore = createStore(
  { startedAt: null } as TimerState,
  ({ setState }) => ({
    start() {
      setState(() => ({ startedAt: new Date() }));
    },
    stop() {
      setState(() => ({ startedAt: null }));
    },
  }),
);
