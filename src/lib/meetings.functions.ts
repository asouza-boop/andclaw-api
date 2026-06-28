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

export const listMeetings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await sb()
    .from("meetings")
    .select("*")
    .order("occurred_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getMeeting = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const c = sb();
    const { data: row, error } = await c.from("meetings").select("*").eq("id", data.id).single();
    if (error) throw new Error(error.message);
    let audioSignedUrl: string | null = null;
    if ((row as any).audio_url) {
      const { data: signed } = await c.storage
        .from("meeting-audio")
        .createSignedUrl((row as any).audio_url, 3600);
      audioSignedUrl = signed?.signedUrl ?? null;
    }
    return { ...row, audioSignedUrl };
  });

export const createMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      title: z.string().min(1).max(200),
      occurred_at: z.string().datetime().optional(),
      participants: z.array(z.string()).default([]),
      duration_minutes: z.number().int().positive().optional(),
      summary: z.string().optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { data: row, error } = await sb().from("meetings").insert({
      title: data.title,
      occurred_at: data.occurred_at ?? new Date().toISOString(),
      participants: data.participants,
      duration_minutes: data.duration_minutes ?? null,
      summary: data.summary ?? null,
      status: "scheduled",
    } as any).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

const ActionItemSchema = z.object({
  title: z.string().min(1),
  owner: z.string().nullable().optional(),
  due: z.string().nullable().optional(),
});
const AlertSchema = z.object({
  text: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]).default("medium"),
});

export const updateMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(200).optional(),
      participants: z.array(z.string()).optional(),
      skills: z.array(z.string()).optional(),
      summary: z.string().nullable().optional(),
      duration_minutes: z.number().int().positive().nullable().optional(),
      status: z.enum(["scheduled", "in_progress", "completed"]).optional(),
      key_points: z.array(z.string()).optional(),
      decisions: z.array(z.string()).optional(),
      ideas: z.array(z.string()).optional(),
      action_items: z.array(ActionItemSchema).optional(),
      alerts: z.array(AlertSchema).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { id, ...patch } = data;
    const { data: row, error } = await sb().from("meetings").update(patch as any).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const c = sb();
    const { data: existing } = await c.from("meetings").select("audio_url").eq("id", data.id).single();
    if ((existing as any)?.audio_url) {
      await c.storage.from("meeting-audio").remove([(existing as any).audio_url]);
    }
    const { error } = await c.from("meetings").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const attachAudio = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), path: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { error } = await sb().from("meetings").update({
      audio_url: data.path,
      status: "in_progress",
    } as any).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const transcribeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const c = sb();
    const { data: row, error } = await c.from("meetings").select("audio_url").eq("id", data.id).single();
    if (error) throw new Error(error.message);
    const path = (row as any)?.audio_url as string | null;
    if (!path) throw new Error("Esta reunião não possui áudio anexado.");

    const { data: blob, error: dlErr } = await c.storage.from("meeting-audio").download(path);
    if (dlErr || !blob) throw new Error(dlErr?.message || "Falha ao baixar áudio");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente.");

    const ext = path.split(".").pop() || "webm";
    const form = new FormData();
    form.append("model", "openai/gpt-4o-mini-transcribe");
    form.append("file", blob, `audio.${ext}`);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      throw new Error(`Transcrição falhou (${resp.status}): ${t.slice(0, 200)}`);
    }
    const j = (await resp.json()) as { text?: string };
    const transcript = j.text?.trim() || "";

    await c.from("meetings").update({
      transcript_text: transcript,
    } as any).eq("id", data.id);

    return { transcript };
  });

const AnalysisSchema = z.object({
  summary: z.string().default(""),
  key_points: z.array(z.string()).default([]),
  action_items: z.array(z.object({
    title: z.string(),
    owner: z.string().optional().nullable(),
    due: z.string().optional().nullable(),
  })).default([]),
  decisions: z.array(z.string()).default([]),
  ideas: z.array(z.string()).default([]),
  alerts: z.array(z.object({
    text: z.string(),
    severity: z.enum(["low", "medium", "high"]).default("medium"),
  })).default([]),
  participants: z.array(z.string()).default([]),
});

export const analyzeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const c = sb();
    const { data: row, error } = await c.from("meetings").select("title,transcript_text").eq("id", data.id).single();
    if (error) throw new Error(error.message);
    const transcript = (row as any).transcript_text as string | null;
    if (!transcript) throw new Error("Transcreva a reunião antes de analisar.");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente.");

    const system = `Você é um analista de reuniões. Receba a transcrição e devolva APENAS um JSON válido com as chaves:
- summary (string, 3-5 linhas)
- key_points (string[])
- action_items ({ title, owner?, due? }[])
- decisions (string[])
- ideas (string[])
- alerts ({ text, severity: "low"|"medium"|"high" }[])
- participants (string[] nomes mencionados)
Responda em português, sem markdown nem texto fora do JSON.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Reunião: ${(row as any).title}\n\nTranscrição:\n${transcript.slice(0, 12000)}` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      throw new Error(`Análise falhou (${resp.status}): ${t.slice(0, 200)}`);
    }
    const j = await resp.json();
    const raw = j.choices?.[0]?.message?.content ?? "{}";
    let parsed: z.infer<typeof AnalysisSchema>;
    try {
      parsed = AnalysisSchema.parse(JSON.parse(raw));
    } catch {
      throw new Error("Resposta da IA inválida.");
    }

    await c.from("meetings").update({
      summary: parsed.summary,
      key_points: parsed.key_points,
      action_items: parsed.action_items,
      decisions: parsed.decisions,
      ideas: parsed.ideas,
      alerts: parsed.alerts,
      participants: parsed.participants.length ? parsed.participants : undefined,
      status: "completed",
    } as any).eq("id", data.id);

    return parsed;
  });

export const convertMeetingToKnowledge = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const c = sb();
    const { data: row, error } = await c.from("meetings").select("*").eq("id", data.id).single();
    if (error) throw new Error(error.message);
    const m = row as any;

    const body = [
      m.summary ? `## Resumo\n${m.summary}` : "",
      m.key_points?.length ? `## Pontos-chave\n${(m.key_points as string[]).map((p) => `- ${p}`).join("\n")}` : "",
      m.decisions?.length ? `## Decisões\n${(m.decisions as string[]).map((p) => `- ${p}`).join("\n")}` : "",
      m.action_items?.length ? `## Ações\n${(m.action_items as any[]).map((a) => `- ${a.title}${a.owner ? ` (@${a.owner})` : ""}`).join("\n")}` : "",
      m.transcript_text ? `## Transcrição\n${m.transcript_text}` : "",
    ].filter(Boolean).join("\n\n");

    const { data: ki, error: kErr } = await c.from("knowledge_items").insert({
      title: `Reunião · ${m.title}`,
      body,
      tags: ["reunião", ...((m.participants as string[]) ?? [])],
    }).select().single();
    if (kErr) throw new Error(kErr.message);

    await c.from("meetings").update({ knowledge_item_id: ki.id } as any).eq("id", data.id);
    return ki;
  });
