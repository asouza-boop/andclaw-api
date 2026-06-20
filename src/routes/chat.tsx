import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/shell/PageHeader";
import { Send, Bot, Paperclip } from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat — AndClaw" }, { name: "description", content: "Converse com os agentes da AndClaw em uma interface unificada." }] }),
  component: ChatPage,
});

const messages = [
  { role: "user", text: "Quais reuniões eu tenho hoje à tarde?" },
  { role: "assistant", text: "Você tem 2 reuniões à tarde:\n\n• 14h00 — Sync de produto com Marina (30 min)\n• 16h30 — Review do release v0.4 (45 min)\n\nReservei 13h–13h45 para preparar a pauta. Quer que eu rascunhe?" },
  { role: "user", text: "Sim, e me lembra 10 min antes de cada uma." },
  { role: "assistant", text: "Feito. Lembretes agendados via Telegram e calendar." },
];

function ChatPage() {
  return (
    <>
      <PageHeader title="Chat" description="Converse diretamente com o orquestrador. Ele aciona skills e agentes conforme necessário." />
      <Card className="p-0 flex flex-col h-[calc(100vh-13rem)]">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
          <div className="h-8 w-8 rounded-full bg-primary-soft border border-primary-dim/60 flex items-center justify-center">
            <Bot size={14} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Orquestrador</p>
            <p className="text-[11px] text-muted-foreground">com acesso a 42 skills · contexto: workspace pessoal</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className={[
                "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line",
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-surface border border-border"
              ].join(" ")}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border p-3 flex items-center gap-2">
          <button className="h-9 w-9 rounded-lg border border-border hover:bg-overlay flex items-center justify-center flex-shrink-0">
            <Paperclip size={14} />
          </button>
          <input
            placeholder="Pergunte qualquer coisa…"
            className="flex-1 h-10 px-3 rounded-lg bg-surface border border-border text-sm outline-none focus:border-primary"
          />
          <button className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5 hover:opacity-90">
            <Send size={14} /> Enviar
          </button>
        </div>
      </Card>
    </>
  );
}
