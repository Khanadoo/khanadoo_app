export function Loader({ lines = 3 }: { lines?: number }) {
  return (
    <div className="surface rounded-[2rem] p-5">
      <div className="animate-pulse space-y-3">
        <div className="h-6 w-32 rounded-full bg-[var(--panel-strong)]" />
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-4 rounded-full bg-[var(--panel-strong)]"
            style={{ width: `${90 - index * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}
