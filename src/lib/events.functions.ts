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

const Tone = z.enum(["primary", "cyan", "success", "warning"]);

const EventInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  day_index: z.number().int().min(0).max(4),
  start_hour: z.number().min(8).max(17.5),
  duration_hours: z.number().min(0.25).max(10),
  tone: Tone.default("primary"),
});

export const listEvents = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await sb()
    .from("events")
    .select("*")
    .order("day_index", { ascending: true })
    .order("start_hour", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

async function assertNoConflict(
  client: ReturnType<typeof sb>,
  day_index: number,
  start_hour: number,
  duration_hours: number,
  excludeId?: string,
) {
  const end = start_hour + duration_hours;
  let q = client.from("events").select("id,title,start_hour,duration_hours").eq("day_index", day_index);
  if (excludeId) q = q.neq("id", excludeId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  for (const e of data ?? []) {
    const eStart = Number(e.start_hour);
    const eEnd = eStart + Number(e.duration_hours);
    if (start_hour < eEnd && end > eStart) {
      throw new Error(`Conflito com "${e.title}" (${eStart}h–${eEnd}h)`);
    }
  }
}

export const createEvent = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EventInput.parse(d))
  .handler(async ({ data }) => {
    const client = sb();
    await assertNoConflict(client, data.day_index, data.start_hour, data.duration_hours);
    const { data: row, error } = await client.from("events").insert(data).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateEvent = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EventInput.extend({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { id, ...patch } = data;
    const client = sb();
    await assertNoConflict(client, patch.day_index, patch.start_hour, patch.duration_hours, id);
    const { data: row, error } = await client.from("events").update(patch).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { error } = await sb().from("events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
