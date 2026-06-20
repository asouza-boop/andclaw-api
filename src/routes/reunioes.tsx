import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/shell/PageHeader";
import { Target, Clock } from "lucide-react";

export const Route = createFileRoute("/reunioes")({
  head: () => ({ meta: [{ title: "Reuniões — AndClaw" }, { name: "description", content: "Reuniões com transcrição e digest automático." }] }),
  component: ReunioesPage,
});

const meetings = [
  { title: "Sync de produto — Atlas", when: "Hoje · 14h00 – 14h30", with: "Marina, Pedro", status: "agendada" },
  { title: "Review release v0.4", when: "Hoje · 16h30 – 17h15", with: "Time eng", status: "agendada" },
  { title: "Discovery — Lumen", when: "Ontem · 10h00", with: "Ana, João", status: "transcrita" },
  { title: "1:1 Marina", when: "Quarta · 11h00", with: "Marina", status: "transcrita" },
];

function ReunioesPage() {
  return (
    <>
      <PageHeader title="Reuniões" description="Transcrições, decisões e ações extraídas automaticamente." />
      <div className="space-y-3">
        {meetings.map((m, i) => (
          <Card key={i} className="flex items-center gap-4 hover:border-primary-dim transition">
            <div className="h-10 w-10 rounded-lg bg-primary-soft border border-primary-dim/60 flex items-center justify-center">
              <Target size={16} className="text-primary"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{m.title}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="inline-flex items-center gap-1"><Clock size={11}/>{m.when}</span>
                <span>com {m.with}</span>
              </div>
            </div>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${m.status === "transcrita" ? "bg-success/15 text-success" : "bg-cyan/15 text-cyan"}`}>
              {m.status}
            </span>
          </Card>
        ))}
      </div>
    </>
  );
}
