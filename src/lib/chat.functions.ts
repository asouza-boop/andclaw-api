import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function sb() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const listConversations = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await sb()
    .from("conversations")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const createConversation = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ title: z.string().min(1).max(120).default("Nova conversa") }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await sb().from("conversations").insert({ title: data.title }).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteConversation = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { error } = await sb().from("conversations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMessages = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ conversationId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { data: rows, error } = await sb()
      .from("messages")
      .select("*")
      .eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const sendMessage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      conversationId: z.string().uuid(),
      content: z.string().min(1).max(4000),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const client = sb();

    // Insert user message
    const { data: userMsg, error: uErr } = await client.from("messages").insert({
      conversation_id: data.conversationId,
      role: "user",
      content: data.content,
    }).select().single();
    if (uErr) throw new Error(uErr.message);

    // Build short history for context
    const { data: history } = await client
      .from("messages")
      .select("role,content")
      .eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    // Call Lovable AI Gateway
    let assistantText = "Recebido.";
    const apiKey = process.env.LOVABLE_API_KEY;
    if (apiKey) {
      try {
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "Você é o orquestrador da AndClaw. Responda em português, breve e objetivo." },
              ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
            ],
          }),
        });
        if (resp.ok) {
          const j = await resp.json();
          assistantText = j.choices?.[0]?.message?.content?.trim() || assistantText;
        } else if (resp.status === 429) {
          assistantText = "Limite de uso atingido. Tente novamente em instantes.";
        } else if (resp.status === 402) {
          assistantText = "Créditos esgotados no workspace. Adicione créditos para continuar.";
        }
      } catch (e) {
        console.error("AI gateway error", e);
      }
    }

    const { data: aiMsg, error: aErr } = await client.from("messages").insert({
      conversation_id: data.conversationId,
      role: "assistant",
      content: assistantText,
    }).select().single();
    if (aErr) throw new Error(aErr.message);

    // Bump conversation updated_at + title if first user message
    const patch: { updated_at: string; title?: string } = { updated_at: new Date().toISOString() };
    const { count } = await client
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", data.conversationId)
      .eq("role", "user");
    if (count === 1) patch.title = data.content.slice(0, 60);
    await client.from("conversations").update(patch).eq("id", data.conversationId);

    return { userMessage: userMsg, assistantMessage: aiMsg };
  });
