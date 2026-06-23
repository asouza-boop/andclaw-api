import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { PageHeader, Card } from "@/components/shell/PageHeader";
import { Send, Bot, Plus, Trash2, MessageSquare } from "lucide-react";
import { listConversations, createConversation, deleteConversation, listMessages, sendMessage } from "@/lib/chat.functions";
import { toast } from "sonner";

const searchSchema = z.object({
  c: fallback(z.string().optional(), undefined),
  m: fallback(z.string().optional(), undefined),
});

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat — AndClaw" }, { name: "description", content: "Conversas persistentes com o orquestrador da AndClaw." }] }),
  validateSearch: zodValidator(searchSchema),
  component: ChatPage,
});

function ChatPage() {
  const { c: activeFromUrl, m: highlightId } = Route.useSearch();
  const navigate = useNavigate({ from: "/chat" });
  const qc = useQueryClient();

  const createFn = useServerFn(createConversation);
  const delFn = useServerFn(deleteConversation);
  const sendFn = useServerFn(sendMessage);

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => listConversations(),
  });

  const activeId = activeFromUrl ?? conversations[0]?.id;

  useEffect(() => {
    if (!activeFromUrl && conversations[0]?.id) {
      navigate({ search: (p: Record<string, unknown>) => ({ ...p, c: conversations[0].id }), replace: true });
    }
  }, [activeFromUrl, conversations, navigate]);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", activeId],
    queryFn: () => listMessages({ data: { conversationId: activeId! } }),
    enabled: !!activeId,
  });

  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  useEffect(() => {
    if (highlightId) {
      const el = document.getElementById(`msg-${highlightId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId, messages.length]);

  const sendMut = useMutation({
    mutationFn: (content: string) => sendFn({ data: { conversationId: activeId!, content } }),
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["messages", activeId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
      inputRef.current?.focus();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createMut = useMutation({
    mutationFn: () => createFn({ data: { title: "Nova conversa" } }),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      navigate({ search: (p: Record<string, unknown>) => ({ ...p, c: row.id, m: undefined }) });
    },
  });

  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      if (activeId === id) navigate({ search: (p: Record<string, unknown>) => ({ ...p, c: undefined, m: undefined }) });
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !activeId || sendMut.isPending) return;
    sendMut.mutate(draft.trim());
  }

  return (
    <>
      <PageHeader
        title="Chat"
        description="Conversas persistidas. Cada mensagem é gravada e o orquestrador responde com contexto."
        actions={
          <button onClick={() => createMut.mutate()} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm">
            <Plus size={14} /> Nova
          </button>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 h-[calc(100vh-13rem)]">
        <Card className="p-2 overflow-y-auto">
          <ul className="space-y-1">
            {conversations.length === 0 && (
              <li className="px-2 py-6 text-center text-xs text-muted-foreground">Sem conversas ainda</li>
            )}
            {conversations.map((c) => (
              <li key={c.id} className="group flex items-center gap-1">
                <button
                  onClick={() => navigate({ search: (p: Record<string, unknown>) => ({ ...p, c: c.id, m: undefined }) })}
                  className={`flex-1 min-w-0 flex items-center gap-2 px-2 py-2 rounded-md text-sm text-left ${c.id === activeId ? "bg-primary-soft text-primary" : "hover:bg-overlay"}`}
                >
                  <MessageSquare size={14} className="flex-shrink-0" />
                  <span className="truncate">{c.title}</span>
                </button>
                <button
                  onClick={() => { if (confirm("Excluir conversa?")) delMut.mutate(c.id); }}
                  className="opacity-0 group-hover:opacity-100 h-7 w-7 inline-flex items-center justify-center rounded text-muted-foreground hover:text-destructive"
                  aria-label="Excluir"
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-0 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
            <div className="h-8 w-8 rounded-full bg-primary-soft border border-primary-dim/60 flex items-center justify-center">
              <Bot size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Orquestrador</p>
              <p className="text-[11px] text-muted-foreground">
                {activeId ? `${messages.length} mensagens` : "Selecione ou crie uma conversa"}
              </p>
            </div>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m) => (
              <div key={m.id} id={`msg-${m.id}`} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={[
                  "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line transition",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-surface border border-border",
                  highlightId === m.id ? "ring-2 ring-primary" : "",
                ].join(" ")}>
                  {m.content}
                </div>
              </div>
            ))}
            {sendMut.isPending && (
              <div className="flex justify-start">
                <div className="bg-surface border border-border rounded-2xl px-4 py-2.5 text-sm text-muted-foreground">
                  Pensando…
                </div>
              </div>
            )}
          </div>
          <form onSubmit={onSubmit} className="border-t border-border p-3 flex items-center gap-2">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={!activeId || sendMut.isPending}
              placeholder={activeId ? "Pergunte qualquer coisa…" : "Crie uma conversa para começar"}
              className="flex-1 h-10 px-3 rounded-lg bg-surface border border-border text-sm outline-none focus:border-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!activeId || !draft.trim() || sendMut.isPending}
              className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5 hover:opacity-90 disabled:opacity-40"
            >
              <Send size={14} /> Enviar
            </button>
          </form>
        </Card>
      </div>
    </>
  );
}
