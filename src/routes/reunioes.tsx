import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader, Card } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Target, Clock, Plus, Users, Search, AlertTriangle, CheckCircle2, Radio } from "lucide-react";
import { listMeetings, createMeeting } from "@/lib/meetings.functions";

export const Route = createFileRoute("/reunioes")({
  head: () => ({ meta: [{ title: "Reuniões — AndClaw" }, { name: "description", content: "Captura, transcrição e inteligência de reuniões." }] }),
  component: ReunioesPage,
});

const statusLabel: Record<string, { label: string; tone: string; icon: any }> = {
  scheduled: { label: "agendada", tone: "bg-cyan/15 text-cyan", icon: Clock },
  in_progress: { label: "processando", tone: "bg-warning/15 text-warning", icon: Radio },
  completed: { label: "concluída", tone: "bg-success/15 text-success", icon: CheckCircle2 },
};

function ReunioesPage() {
  const qc = useQueryClient();
  const list = useServerFn(listMeetings);
  const create = useServerFn(createMeeting);
  const { data: meetings = [] } = useQuery({ queryKey: ["meetings"], queryFn: () => list() });
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", participants: "", duration: "", summary: "" });

  const createMut = useMutation({
    mutationFn: () => create({ data: {
      title: form.title,
      participants: form.participants.split(",").map((s) => s.trim()).filter(Boolean),
      duration_minutes: form.duration ? Number(form.duration) : undefined,
      summary: form.summary || undefined,
    } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meetings"] });
      setOpen(false);
      setForm({ title: "", participants: "", duration: "", summary: "" });
    },
  });

  const filtered = (meetings as any[]).filter((m) =>
    !q || m.title?.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Reuniões"
        description="Hub de captura, transcrição, inteligência e sincronização."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus size={14} className="mr-1" /> Nova reunião</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova reunião</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Título</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sync de produto" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Participantes (separados por vírgula)</Label>
                    <Input value={form.participants} onChange={(e) => setForm({ ...form, participants: e.target.value })} placeholder="Marina, Pedro" />
                  </div>
                  <div>
                    <Label>Duração (min)</Label>
                    <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} type="number" placeholder="30" />
                  </div>
                </div>
                <div>
                  <Label>Notas iniciais</Label>
                  <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={() => createMut.mutate()} disabled={!form.title || createMut.isPending}>
                  {createMut.isPending ? "Criando…" : "Criar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar reuniões…" className="pl-9" />
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <Card className="text-sm text-muted-foreground">Nenhuma reunião ainda. Crie a primeira.</Card>
        )}
        {filtered.map((m) => {
          const st = statusLabel[m.status as string] ?? statusLabel.scheduled;
          const StIcon = st.icon;
          const alerts = (m.alerts as any[]) ?? [];
          const actions = (m.action_items as any[]) ?? [];
          const decisions = (m.decisions as string[]) ?? [];
          return (
            <Link key={m.id} to="/reunioes/$id" params={{ id: m.id }} className="block">
              <Card className="hover:border-primary-dim transition">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary-soft border border-primary-dim/60 flex items-center justify-center">
                    <Target size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{m.title}</p>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${st.tone}`}>
                        <StIcon size={10} /> {st.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                      <span className="inline-flex items-center gap-1"><Clock size={11} />{new Date(m.occurred_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                      {m.duration_minutes && <span>{m.duration_minutes} min</span>}
                      {(m.participants as string[])?.length > 0 && (
                        <span className="inline-flex items-center gap-1"><Users size={11} />{(m.participants as string[]).slice(0, 3).join(", ")}{(m.participants as string[]).length > 3 ? "…" : ""}</span>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs">
                    {actions.length > 0 && <Badge variant="secondary">{actions.length} ações</Badge>}
                    {decisions.length > 0 && <Badge variant="secondary">{decisions.length} decisões</Badge>}
                    {alerts.length > 0 && (
                      <Badge className="bg-warning/15 text-warning border-warning/30"><AlertTriangle size={10} className="mr-1" />{alerts.length}</Badge>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
