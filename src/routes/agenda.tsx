import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/shell/PageHeader";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/agenda")({
  head: () => ({ meta: [{ title: "Agenda — AndClaw" }, { name: "description", content: "Sua agenda unificada com Google Calendar e blocos focais." }] }),
  component: AgendaPage,
});

const hours = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);
const events = [
  { day: 1, start: 0, span: 2, title: "Foco — Atlas", tone: "primary" },
  { day: 1, start: 3, span: 1, title: "1:1 Marina", tone: "cyan" },
  { day: 2, start: 1, span: 2, title: "Sync produto", tone: "primary" },
  { day: 3, start: 5, span: 2, title: "Review release", tone: "warning" },
  { day: 4, start: 2, span: 1, title: "Pesquisa RAG", tone: "cyan" },
  { day: 0, start: 6, span: 1, title: "Demo Skills", tone: "success" },
];
const days = ["Seg", "Ter", "Qua", "Qui", "Sex"];

function AgendaPage() {
  return (
    <>
      <PageHeader
        title="Agenda"
        description="Semana de 16–20 dez · sincronizado com Google Calendar"
        actions={<button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm"><Plus size={14}/> Bloco focal</button>}
      />
      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-border">
          <div />
          {days.map((d) => (
            <div key={d} className="px-3 py-2 text-xs font-semibold text-muted-foreground border-l border-border">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-[60px_repeat(5,1fr)] relative">
          <div>
            {hours.map((h) => (
              <div key={h} className="h-14 text-[10px] text-muted-foreground pr-2 text-right pt-1">{h}</div>
            ))}
          </div>
          {days.map((d, di) => (
            <div key={d} className="border-l border-border relative">
              {hours.map((_, i) => <div key={i} className="h-14 border-b border-border/50" />)}
              {events.filter((e) => e.day === di).map((e, i) => {
                const bg = e.tone === "primary" ? "bg-primary-soft border-primary-dim text-primary"
                  : e.tone === "cyan" ? "bg-cyan/15 border-cyan/40 text-cyan"
                  : e.tone === "warning" ? "bg-warning/15 border-warning/40 text-warning"
                  : "bg-success/15 border-success/40 text-success";
                return (
                  <div key={i}
                    className={`absolute left-1 right-1 rounded-md border px-2 py-1 text-[11px] font-medium ${bg}`}
                    style={{ top: `${e.start * 3.5}rem`, height: `${e.span * 3.5 - 0.25}rem` }}
                  >
                    {e.title}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
