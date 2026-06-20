import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({
  label, value, hint, accent,
}: { label: string; value: string; hint?: string; accent?: "primary" | "cyan" | "success" | "warning" }) {
  const accentColor =
    accent === "cyan" ? "text-cyan"
    : accent === "success" ? "text-success"
    : accent === "warning" ? "text-warning"
    : "text-primary";
  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${accentColor}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
