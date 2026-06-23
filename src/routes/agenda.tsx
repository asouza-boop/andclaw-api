import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { PageHeader, Card } from "@/components/shell/PageHeader";
import { Plus, Trash2 } from "lucide-react";
import { listEvents, createEvent, updateEvent, deleteEvent } from "@/lib/events.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/agenda")({
  head: () => ({ meta: [{ title: "Agenda — AndClaw" }, { name: "description", content: "Sua agenda unificada com criação, edição e exclusão de eventos." }] }),
  component: AgendaPage,
});

const days = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const hours = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);

type EventRow = Awaited<ReturnType<typeof listEvents>>[number];

type FormState = {
  id?: string;
  title: string;
  description: string;
  day_index: number;
  start_hour: number;
  duration_hours: number;
  tone: "primary" | "cyan" | "success" | "warning";
};

const empty: FormState = { title: "", description: "", day_index: 0, start_hour: 9, duration_hours: 1, tone: "primary" };

function AgendaPage() {
  const qc = useQueryClient();
  const { data: events = [] } = useQuery({ queryKey: ["events"], queryFn: () => listEvents() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);

  const createFn = useServerFn(createEvent);
  const updateFn = useServerFn(updateEvent);
  const deleteFn = useServerFn(deleteEvent);

  const saveMut = useMutation({
    mutationFn: async (f: FormState) => {
      const payload = {
        title: f.title,
        description: f.description || null,
        day_index: f.day_index,
        start_hour: f.start_hour,
        duration_hours: f.duration_hours,
        tone: f.tone,
      };
      if (f.id) return updateFn({ data: { id: f.id, ...payload } });
      return createFn({ data: payload });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      setOpen(false);
      toast.success(form.id ? "Evento atualizado" : "Evento criado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      setOpen(false);
      toast.success("Evento removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew(day?: number, hour?: number) {
    setForm({ ...empty, day_index: day ?? 0, start_hour: hour ?? 9 });
    setOpen(true);
  }
  function openEdit(e: EventRow) {
    setForm({
      id: e.id,
      title: e.title,
      description: e.description ?? "",
      day_index: e.day_index,
      start_hour: Number(e.start_hour),
      duration_hours: Number(e.duration_hours),
      tone: e.tone as FormState["tone"],
    });
    setOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Semana de trabalho · clique em um horário vazio para criar, em um evento para editar."
        actions={
          <button onClick={() => openNew()} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm">
            <Plus size={14} /> Novo evento
          </button>
        }
      />
      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-border">
          <div />
          {days.map((d) => (
            <div key={d} className="px-3 py-2 text-xs font-semibold text-muted-foreground border-l border-border">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-[60px_repeat(5,1fr)] relative">
          <div>
            {hours.map((h) => (
              <div key={h} className="h-14 text-[10px] text-muted-foreground pr-2 text-right pt-1">{h}</div>
            ))}
          </div>
          {days.map((d, di) => (
            <div key={d} className="border-l border-border relative">
              {hours.map((_, hi) => (
                <button
                  key={hi}
                  onClick={() => openNew(di, 8 + hi)}
                  className="h-14 w-full border-b border-border/50 hover:bg-overlay/40 transition cursor-pointer"
                />
              ))}
              {events.filter((e) => e.day_index === di).map((e) => {
                const tone = e.tone as FormState["tone"];
                const bg = tone === "primary" ? "bg-primary-soft border-primary-dim text-primary"
                  : tone === "cyan" ? "bg-cyan/15 border-cyan/40 text-cyan"
                  : tone === "warning" ? "bg-warning/15 border-warning/40 text-warning"
                  : "bg-success/15 border-success/40 text-success";
                const top = (Number(e.start_hour) - 8) * 3.5;
                const height = Number(e.duration_hours) * 3.5 - 0.25;
                return (
                  <button
                    key={e.id}
                    onClick={() => openEdit(e)}
                    className={`absolute left-1 right-1 rounded-md border px-2 py-1 text-[11px] font-medium text-left ${bg}`}
                    style={{ top: `${top}rem`, height: `${height}rem` }}
                  >
                    {e.title}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar evento" : "Novo evento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Título</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Dia</Label>
                <Select value={String(form.day_index)} onValueChange={(v) => setForm({ ...form, day_index: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{days.map((d, i) => <SelectItem key={d} value={String(i)}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cor</Label>
                <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v as FormState["tone"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Roxo</SelectItem>
                    <SelectItem value="cyan">Ciano</SelectItem>
                    <SelectItem value="success">Verde</SelectItem>
                    <SelectItem value="warning">Âmbar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Início (hora)</Label>
                <Input type="number" min={8} max={17.5} step={0.5}
                  value={form.start_hour}
                  onChange={(e) => setForm({ ...form, start_hour: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Duração (horas)</Label>
                <Input type="number" min={0.5} max={10} step={0.5}
                  value={form.duration_hours}
                  onChange={(e) => setForm({ ...form, duration_hours: Number(e.target.value) })} />
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            {form.id ? (
              <Button variant="destructive" size="sm" onClick={() => delMut.mutate(form.id!)} disabled={delMut.isPending}>
                <Trash2 size={14} /> Excluir
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending || !form.title.trim()}>
                {saveMut.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
