import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, StatCard } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/aprendizado")({
  head: () => ({ meta: [{ title: "Inteligência — AndClaw" }, { name: "description", content: "Painel de aprendizado dos agentes." }] }),
  component: AprendizadoPage,
});

function AprendizadoPage() {
  return (
    <>
      <PageHeader title="Inteligência" description="Como os agentes estão aprendendo a partir de feedback e avaliações." />
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Avaliações" value="1.284" hint="últimos 30 dias" accent="primary"/>
        <StatCard label="Acerto médio" value="92%" hint="+4pp vs mês anterior" accent="success"/>
        <StatCard label="Skills auto-tunadas" value="8" accent="cyan"/>
        <StatCard label="Experimentos ativos" value="3" accent="warning"/>
      </div>
      <Card>
        <h3 className="text-sm font-semibold mb-4">Tendência de qualidade (últimas 8 semanas)</h3>
        <div className="flex items-end gap-2 h-40">
          {[62, 68, 71, 70, 78, 82, 88, 92].map((v, i) => (
            <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-primary/30 to-primary" style={{ height: `${v}%` }} title={`${v}%`} />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          {["S-7","S-6","S-5","S-4","S-3","S-2","S-1","Atual"].map((l) => <span key={l}>{l}</span>)}
        </div>
      </Card>
    </>
  );
}
