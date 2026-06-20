import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/shell/PageHeader";
import { Bot, Plus } from "lucide-react";

export const Route = createFileRoute("/agentes")({
  head: () => ({ meta: [{ title: "Agentes — AndClaw" }, { name: "description", content: "Agentes configurados no workspace." }] }),
  component: AgentesPage,
});

const agents = [
  { name: "Planner", role: "Decompõe metas em tarefas", status: "ativo", runs: 142 },
  { name: "Researcher", role: "Pesquisa e síntese de fontes", status: "ativo", runs: 87 },
  { name: "Scheduler", role: "Gerencia agenda e blocos focais", status: "ativo", runs: 56 },
  { name: "Inbox Triage", role: "Classifica e responde mensagens", status: "ativo", runs: 312 },
  { name: "Eval", role: "Avalia outputs e gates de release", status: "pausado", runs: 28 },
  { name: "Meeting Digest", role: "Resume transcrições", status: "ativo", runs: 41 },
];

function AgentesPage() {
  return (
    <>
      <PageHeader
        title="Agentes"
        description="Agentes especializados com escopos e ferramentas distintos."
        actions={<button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm"><Plus size={14}/> Novo agente</button>}
      />
      <div className="grid md:grid-cols-2 gap-4">
        {agents.map((a) => (
          <Card key={a.name} className="flex items-center gap-4 hover:border-primary-dim transition">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/60 to-cyan/60 flex items-center justify-center glow-ring">
              <Bot size={18} className="text-primary-foreground"/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{a.name}</h3>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ${a.status === "ativo" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                  {a.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{a.role}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">{a.runs}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">execuções</p>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
