import { cn } from "@/lib/utils";

interface PageSkeletonProps {
  blocks?: number;
  blockHeight?: string;
  subtitle?: boolean;
  maxWidth?: string;
}

export function PageSkeleton({
  blocks = 3,
  blockHeight = "h-40",
  subtitle = true,
  maxWidth,
}: PageSkeletonProps) {
  return (
    <div className={cn("space-y-6", maxWidth)}>
      <div>
        <div className="h-10 w-64 bg-white/5 rounded-lg animate-pulse" />
        {subtitle && (
          <div className="h-4 w-48 bg-white/5 rounded mt-2 animate-pulse" />
        )}
      </div>

      {Array.from({ length: blocks }, (_, i) => (
        <div
          key={i}
          className={cn("bg-white/5 rounded-2xl animate-pulse", blockHeight)}
        />
      ))}
    </div>
  );
}
