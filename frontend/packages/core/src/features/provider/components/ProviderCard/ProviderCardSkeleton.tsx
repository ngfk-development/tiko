import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from '#/components/ui/card.tsx';
import { Skeleton } from '#/components/ui/skeleton.tsx';

export interface ProviderCardSkeletonProps {
  className?: string;
}

export function ProviderCardSkeleton(props: ProviderCardSkeletonProps) {
  return (
    <Card className={props.className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-md" />
          <Skeleton className="h-4 w-24" />
        </div>

        <CardAction>
          <Skeleton className="h-5 w-20 rounded-4xl" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>

      <CardFooter className="flex gap-2">
        <Skeleton className="h-7 w-20 rounded-lg" />

        <Skeleton className="size-7 rounded-lg" />
      </CardFooter>
    </Card>
  );
}
