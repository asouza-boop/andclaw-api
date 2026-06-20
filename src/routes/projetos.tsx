import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/shell/PageHeader";
import { FolderOpen, Plus } from "lucide-react";

export const Route = createFileRoute("/projetos")({
  head: () => ({ meta: [{ title: "Projetos — AndClaw" }, { name: "description", content: "Projetos ativos no workspace AndClaw." }] }),
  component: ProjetosPage,
});

const projects = [
  { name: "Atlas", desc: "Plataforma de orquestração de agentes", progress: 64, tasks: 18, due: "30 jan" },
  { name: "Lumen", desc: "Knowledge base com RAG híbrido", progress: 32, tasks: 24, due: "15 fev" },
  { name: "Pulse", desc: "Telemetria e learning loop", progress: 88, tasks: 6, due: "22 dez" },
  { name: "Loom", desc: "Skill marketplace interno", progress: 12, tasks: 9, due: "Q1" },
];

function ProjetosPage() {
  return (
    <>
      <PageHeader
        title="Projetos"
        description="Iniciativas em andamento."
        actions={<button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm"><Plus size={14}/> Novo</button>}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <Card key={p.name} className="hover:border-primary-dim transition cursor-pointer">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary-soft border border-primary-dim/60 flex items-center justify-center">
                <FolderOpen size={16} className="text-primary"/>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-surface overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-cyan" style={{ width: `${p.progress}%` }}/>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>{p.tasks} tarefas</span>
              <span>{p.progress}% · entrega {p.due}</span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
