export function EmptyState({ title, description, action }) {
  return (
    <div className="glass rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
      <div className="mx-auto h-20 w-20 rounded-full bg-[var(--primary)]/15" />
      <h3 className="mt-4 heading-font text-xl">{title}</h3>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
