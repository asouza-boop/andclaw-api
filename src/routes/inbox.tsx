import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/shell/PageHeader";
import { Inbox as InboxIcon, Mail, MessageSquare, Filter } from "lucide-react";

export const Route = createFileRoute("/inbox")({
  head: () => ({ meta: [{ title: "Inbox — AndClaw" }, { name: "description", content: "Caixa unificada de mensagens, alertas e itens triados pelos agentes." }] }),
  component: InboxPage,
});

const items = [
  { from: "Telegram · @marina", subject: "Confirma reunião quinta 10h?", time: "09:42", unread: true, tag: "agendar" },
  { from: "Planner agent", subject: "3 tarefas vencendo nas próximas 24h", time: "09:10", unread: true, tag: "tarefa" },
  { from: "Gmail · stripe.com", subject: "Pagamento recebido — R$ 4.200,00", time: "08:55", unread: true, tag: "financeiro" },
  { from: "Notion webhook", subject: "Página 'OKRs Q4' editada por Pedro", time: "ontem", unread: false, tag: "doc" },
  { from: "Researcher agent", subject: "Resumo: papers sobre RAG híbrido", time: "ontem", unread: true, tag: "pesquisa" },
  { from: "Calendar", subject: "Cancelada: Sync com Design", time: "ontem", unread: false, tag: "agenda" },
  { from: "Telegram · @joao", subject: "Manda o link do repo?", time: "2 dias", unread: false, tag: "chat" },
];

function InboxPage() {
  return (
    <>
      <PageHeader
        title="Inbox"
        description="Tudo que chegou para você ou foi triado pelos agentes — em um único lugar."
        actions={
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm hover:bg-overlay">
            <Filter size={14} /> Filtros
          </button>
        }
      />
      <Card className="p-0 overflow-hidden">
        <ul className="divide-y divide-border">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-overlay/60 transition cursor-pointer">
              <div className={`h-2 w-2 rounded-full ${it.unread ? "bg-primary" : "bg-transparent border border-border"}`} />
              <div className="h-8 w-8 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0">
                {it.from.startsWith("Telegram") ? <MessageSquare size={14} className="text-cyan" /> :
                 it.from.startsWith("Gmail") ? <Mail size={14} className="text-warning" /> :
                 <InboxIcon size={14} className="text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${it.unread ? "font-semibold" : "text-muted-foreground"}`}>{it.from}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-soft text-primary uppercase tracking-wider">{it.tag}</span>
                </div>
                <p className={`text-sm truncate ${it.unread ? "text-foreground" : "text-muted-foreground"}`}>{it.subject}</p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">{it.time}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
