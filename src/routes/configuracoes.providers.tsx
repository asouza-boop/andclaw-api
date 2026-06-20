import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/shell/PageHeader";
import { Check } from "lucide-react";

export const Route = createFileRoute("/configuracoes/providers")({
  component: ProvidersPage,
});

const providers = [
  { name: "Google Calendar", connected: true, scope: "events.read, events.write" },
  { name: "Gmail", connected: true, scope: "messages.read" },
  { name: "Notion", connected: true, scope: "workspace inteiro" },
  { name: "Telegram", connected: true, scope: "bot @andclaw_bot" },
  { name: "Slack", connected: false },
  { name: "Linear", connected: false },
];

function ProvidersPage() {
  return (
    <div className="grid sm:grid-cols-2 gap-3 max-w-3xl">
      {providers.map((p) => (
        <Card key={p.name} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-surface border border-border flex items-center justify-center font-semibold text-xs">
            {p.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{p.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{p.connected ? p.scope : "não conectado"}</p>
          </div>
          {p.connected ? (
            <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-success/15 text-success inline-flex items-center gap-1">
              <Check size={10}/> conectado
            </span>
          ) : (
            <button className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-overlay">Conectar</button>
          )}
        </Card>
      ))}
    </div>
  );
}
