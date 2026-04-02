export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--brand-deep)]">
        {eyebrow}
      </p>
      <h2 className="display-font text-3xl leading-tight font-semibold text-[var(--foreground)] sm:text-4xl">
        {title}
      </h2>
      <p className="text-base leading-7 text-[var(--muted)]">{description}</p>
    </div>
  );
}
