import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/shell/PageHeader";
import { Zap } from "lucide-react";

export const Route = createFileRoute("/skills")({
  head: () => ({ meta: [{ title: "Skills — AndClaw" }, { name: "description", content: "Capacidades disponíveis para os agentes." }] }),
  component: SkillsPage,
});

const skills = [
  { name: "calendar.create_event", domain: "Google Calendar", uses: 412 },
  { name: "calendar.list_today", domain: "Google Calendar", uses: 1820 },
  { name: "notion.search", domain: "Notion", uses: 264 },
  { name: "notion.append_block", domain: "Notion", uses: 98 },
  { name: "telegram.send", domain: "Telegram", uses: 902 },
  { name: "web.search", domain: "Pesquisa", uses: 543 },
  { name: "pdf.extract", domain: "Documentos", uses: 76 },
  { name: "meeting.digest", domain: "Reuniões", uses: 41 },
  { name: "memory.recall", domain: "Memória", uses: 1207 },
];

function SkillsPage() {
  return (
    <>
      <PageHeader title="Skills" description="Capacidades modulares carregadas a partir de specs YAML." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {skills.map((s) => (
          <Card key={s.name} className="flex items-center gap-3 hover:border-primary-dim transition">
            <div className="h-9 w-9 rounded-lg bg-cyan/15 border border-cyan/30 flex items-center justify-center">
              <Zap size={14} className="text-cyan"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm truncate">{s.name}</p>
              <p className="text-[11px] text-muted-foreground">{s.domain}</p>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">{s.uses}</span>
          </Card>
        ))}
      </div>
    </>
  );
}
