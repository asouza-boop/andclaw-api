import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Card, StatCard } from "@/components/shell/PageHeader";
import { ArrowUpRight, Inbox, MessageSquare, Calendar, Bot, Zap, Activity } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AndClaw" },
      { name: "description", content: "Visão geral do workspace AndClaw: inbox, agenda, agentes ativos e desempenho." },
    ],
  }),
  component: DashboardPage,
});

const quickLinks = [
  { to: "/inbox", label: "Inbox", icon: Inbox, hint: "4 não lidos" },
  { to: "/chat", label: "Chat", icon: MessageSquare, hint: "Conversar com agente" },
  { to: "/agenda", label: "Agenda", icon: Calendar, hint: "3 eventos hoje" },
  { to: "/agentes", label: "Agentes", icon: Bot, hint: "6 ativos" },
] as const;

function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Bom dia, Alessandro"
        description="Resumo do workspace e atividade recente dos seus agentes."
        actions={
          <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition glow-ring">
            <Zap size={14} /> Nova tarefa
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Tarefas abertas" value="12" hint="+3 esta semana" accent="primary" />
        <StatCard label="Agentes ativos" value="6" hint="2 executando" accent="cyan" />
        <StatCard label="Reuniões hoje" value="3" hint="Próxima 14h" accent="success" />
        <StatCard label="Skills carregadas" value="42" hint="3 atualizadas" accent="warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Atividade dos agentes</h3>
            <Link to="/evolucao" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              Ver tudo <ArrowUpRight size={12} />
            </Link>
          </div>
          <ul className="space-y-3">
            {[
              { agent: "Planner", action: "Reorganizou tarefas do projeto Atlas", time: "há 4 min" },
              { agent: "Researcher", action: "Sintetizou 12 fontes sobre 'embeddings esparsos'", time: "há 22 min" },
              { agent: "Scheduler", action: "Reservou 2 blocos focais para amanhã", time: "há 1 h" },
              { agent: "Inbox Triage", action: "Classificou 38 mensagens do Telegram", time: "há 2 h" },
              { agent: "Eval", action: "Aprovou release do skill 'meeting-digest'", time: "há 5 h" },
            ].map((r, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-overlay/60 transition">
                <div className="h-8 w-8 rounded-lg bg-primary-soft border border-primary-dim/60 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{r.agent}</span>{" "}
                    <span className="text-muted-foreground">{r.action}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold mb-4">Atalhos</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((q) => {
              const Icon = q.icon;
              return (
                <Link
                  key={q.to}
                  to={q.to}
                  className="flex flex-col gap-1 p-3 rounded-lg border border-border hover:border-primary-dim hover:bg-primary-soft transition"
                >
                  <Icon size={16} className="text-primary" />
                  <span className="text-sm font-medium">{q.label}</span>
                  <span className="text-[11px] text-muted-foreground">{q.hint}</span>
                </Link>
              );
            })}
          </div>
          <div className="mt-5 pt-5 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} className="text-cyan" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saúde</h4>
            </div>
            <div className="space-y-2 text-xs">
              <Row label="Telegram bot" value="online" tone="success" />
              <Row label="Google Calendar" value="sync 2 min" tone="success" />
              <Row label="Notion" value="degradado" tone="warning" />
              <Row label="Postgres" value="64 ms" tone="success" />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: "success" | "warning" | "danger" }) {
  const dot = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="inline-flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {value}
      </span>
    </div>
  );
}
