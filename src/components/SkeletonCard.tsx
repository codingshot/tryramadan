interface SkeletonCardProps {
  type?: "default" | "timer" | "cultural" | "recipe";
}

export const SkeletonCard = ({ type = "default" }: SkeletonCardProps) => {
  if (type === "timer") {
    return (
      <div className="timer-display animate-pulse">
        <div className="h-4 w-24 mx-auto skeleton-ramadan rounded mb-4" />
        <div className="h-20 w-48 mx-auto skeleton-ramadan rounded-lg mb-4" />
        <div className="h-3 w-32 mx-auto skeleton-ramadan rounded" />
      </div>
    );
  }

  if (type === "cultural") {
    return (
      <div className="card-cultural animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 skeleton-ramadan rounded-full" />
          <div className="flex-1">
            <div className="h-4 w-24 skeleton-ramadan rounded mb-2" />
            <div className="h-3 w-16 skeleton-ramadan rounded" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 skeleton-ramadan rounded" />
          <div className="h-3 w-3/4 skeleton-ramadan rounded" />
        </div>
      </div>
    );
  }

  if (type === "recipe") {
    return (
      <div className="card-cultural animate-pulse">
        <div className="h-40 skeleton-ramadan rounded-lg mb-4" />
        <div className="h-4 w-32 skeleton-ramadan rounded mb-2" />
        <div className="h-3 skeleton-ramadan rounded mb-1" />
        <div className="h-3 w-2/3 skeleton-ramadan rounded" />
      </div>
    );
  }

  return (
    <div className="card-cultural animate-pulse">
      <div className="h-4 w-1/2 skeleton-ramadan rounded mb-4" />
      <div className="space-y-2">
        <div className="h-3 skeleton-ramadan rounded" />
        <div className="h-3 w-4/5 skeleton-ramadan rounded" />
        <div className="h-3 w-3/4 skeleton-ramadan rounded" />
      </div>
    </div>
  );
};
