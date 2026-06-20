import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/evolucao")({
  head: () => ({ meta: [{ title: "Evolução — AndClaw" }, { name: "description", content: "Log de evolução do workspace e dos agentes." }] }),
  component: EvolucaoPage,
});

const log = [
  { v: "v0.4.1", date: "hoje", notes: "Skill 'meeting.digest' atualizada; latência -22%" },
  { v: "v0.4.0", date: "12 dez", notes: "Novo agente: Eval. Gates automáticos de release." },
  { v: "v0.3.7", date: "5 dez", notes: "Inbox triage com classificação multi-rótulo." },
  { v: "v0.3.5", date: "28 nov", notes: "Integração Notion → ingestão de páginas marcadas." },
  { v: "v0.3.0", date: "12 nov", notes: "Reescrita do orquestrador, plano de execução adaptativo." },
];

function EvolucaoPage() {
  return (
    <>
      <PageHeader title="Evolução" description="Timeline de mudanças, releases e aprendizados acumulados." />
      <Card>
        <ol className="relative border-l border-border ml-2 space-y-6">
          {log.map((e, i) => (
            <li key={i} className="ml-6">
              <span className="absolute -left-1.5 h-3 w-3 rounded-full bg-primary glow-ring" />
              <div className="flex items-baseline gap-3">
                <h3 className="text-sm font-semibold">{e.v}</h3>
                <span className="text-xs text-muted-foreground">{e.date}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{e.notes}</p>
            </li>
          ))}
        </ol>
      </Card>
    </>
  );
}
