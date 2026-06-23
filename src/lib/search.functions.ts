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

export type SearchResult = {
  id: string;
  kind: "meeting" | "knowledge" | "project" | "message";
  title: string;
  snippet: string;
  route: string;
};

export const globalSearch = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ q: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }): Promise<SearchResult[]> => {
    const q = data.q.trim();
    const like = `%${q}%`;
    const client = sb();

    const [meetings, knowledge, projects, messages] = await Promise.all([
      client.from("meetings").select("id,title,summary").or(`title.ilike.${like},summary.ilike.${like}`).limit(5),
      client.from("knowledge_items").select("id,title,body").or(`title.ilike.${like},body.ilike.${like}`).limit(5),
      client.from("projects").select("id,name,description").or(`name.ilike.${like},description.ilike.${like}`).limit(5),
      client.from("messages").select("id,content,conversation_id").ilike("content", like).limit(5),
    ]);

    const results: SearchResult[] = [];
    for (const m of meetings.data ?? []) {
      results.push({ id: m.id, kind: "meeting", title: m.title, snippet: m.summary ?? "", route: `/reunioes?focus=${m.id}` });
    }
    for (const k of knowledge.data ?? []) {
      results.push({ id: k.id, kind: "knowledge", title: k.title, snippet: (k.body ?? "").slice(0, 140), route: `/conhecimento?focus=${k.id}` });
    }
    for (const p of projects.data ?? []) {
      results.push({ id: p.id, kind: "project", title: p.name, snippet: p.description ?? "", route: `/projetos?focus=${p.id}` });
    }
    for (const msg of messages.data ?? []) {
      results.push({
        id: msg.id,
        kind: "message",
        title: msg.content.slice(0, 60),
        snippet: msg.content.slice(0, 160),
        route: `/chat?c=${msg.conversation_id}&m=${msg.id}`,
      });
    }
    return results;
  });
