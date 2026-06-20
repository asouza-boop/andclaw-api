import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/shell/PageHeader";
import { BookOpen, Search } from "lucide-react";

export const Route = createFileRoute("/conhecimento")({
  head: () => ({ meta: [{ title: "Conhecimento — AndClaw" }, { name: "description", content: "Base de conhecimento indexada para os agentes." }] }),
  component: ConhecimentoPage,
});

const docs = [
  { title: "Arquitetura do orquestrador", source: "docs/arch.md", tokens: "12k" },
  { title: "Padrões de skill spec", source: "specs/skills.yaml", tokens: "4k" },
  { title: "OKRs 2026", source: "Notion", tokens: "2k" },
  { title: "Transcrições — reuniões dez/26", source: "Drive", tokens: "48k" },
  { title: "Pesquisa: RAG híbrido", source: "Researcher", tokens: "9k" },
];

function ConhecimentoPage() {
  return (
    <>
      <PageHeader
        title="Conhecimento"
        description="Documentos, transcrições e notas indexados e disponíveis via embeddings."
      />
      <div className="flex items-center gap-2 h-10 px-3 rounded-lg bg-surface border border-border mb-5 max-w-xl">
        <Search size={14} className="text-muted-foreground"/>
        <input className="flex-1 bg-transparent outline-none text-sm" placeholder="Buscar por significado…"/>
      </div>
      <div className="space-y-2">
        {docs.map((d) => (
          <Card key={d.title} className="flex items-center gap-4 hover:border-primary-dim transition cursor-pointer">
            <BookOpen size={16} className="text-primary"/>
            <div className="flex-1">
              <p className="text-sm font-medium">{d.title}</p>
              <p className="text-[11px] text-muted-foreground">{d.source}</p>
            </div>
            <span className="text-xs text-muted-foreground">{d.tokens}</span>
          </Card>
        ))}
      </div>
    </>
  );
}
