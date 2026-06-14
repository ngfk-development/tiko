import { useSelector } from '@tanstack/react-store';
import { Button } from '@tiko/core';
import { PlayIcon, SquareIcon } from 'lucide-react';

import { useElapsedSeconds } from '#/hooks/use-elapsed-seconds.ts';
import { useMessages } from '#/hooks/use-messages.ts';
import { timerStore } from '#/stores/timer-store.ts';

function formatElapsed(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((n) => n.toString().padStart(2, '0'))
    .join(':');
}

export function TimerControl() {
  const m = useMessages();
  const startedAt = useSelector(timerStore, (state) => state.startedAt);
  const elapsed = useElapsedSeconds(startedAt);

  if (!startedAt) {
    return (
      <Button size="sm" onClick={() => timerStore.actions.start()}>
        <PlayIcon />
        {m.general.startTimer}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-full items-center gap-2">
        <div className="bg-primary size-2 animate-pulse rounded-full" />
        <div className="text-base leading-none font-semibold tabular-nums">
          {formatElapsed(elapsed)}
        </div>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={() => timerStore.actions.stop()}
      >
        <SquareIcon />
        {m.general.stopTimer}
      </Button>
    </div>
  );
}
