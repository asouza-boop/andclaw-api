import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/shell/PageHeader";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle, CheckSquare, Gavel, Lightbulb, BookOpen,
  Plus, Trash2, Save, Undo2, Loader2,
} from "lucide-react";

export type ActionItem = { title: string; owner?: string | null; due?: string | null };
export type Alert = { text: string; severity: "low" | "medium" | "high" };

export type IntelligenceDraft = {
  key_points: string[];
  decisions: string[];
  ideas: string[];
  action_items: ActionItem[];
  alerts: Alert[];
};

function eq(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function IntelligenceEditor({
  initial,
  saving,
  onSave,
}: {
  initial: IntelligenceDraft;
  saving: boolean;
  onSave: (next: IntelligenceDraft) => Promise<void> | void;
}) {
  const [draft, setDraft] = useState<IntelligenceDraft>(initial);

  // Reset draft when server data changes (after successful save / refetch).
  useEffect(() => { setDraft(initial); }, [initial]);

  const dirty = useMemo(() => !eq(draft, initial), [draft, initial]);

  const update = <K extends keyof IntelligenceDraft>(key: K, val: IntelligenceDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: val }));

  return (
    <div className="space-y-3">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-lg border border-border bg-card/80 backdrop-blur px-3 py-2">
        <p className="text-xs text-muted-foreground">
          {dirty ? "Alterações não salvas — revise antes de publicar." : "Sem alterações pendentes."}
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setDraft(initial)} disabled={!dirty || saving}>
            <Undo2 size={14} className="mr-1" /> Desfazer
          </Button>
          <Button size="sm" onClick={() => onSave(draft)} disabled={!dirty || saving}>
            {saving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Save size={14} className="mr-1" />}
            Salvar revisão
          </Button>
        </div>
      </div>

      {/* Key points */}
      <Card>
        <Header icon={<BookOpen size={12} />} label="Pontos-chave" onAdd={() => update("key_points", [...draft.key_points, ""])} />
        <StringList
          items={draft.key_points}
          onChange={(items) => update("key_points", items)}
          placeholder="Ponto-chave"
          empty="Nenhum ponto-chave."
        />
      </Card>

      {/* Action items */}
      <Card>
        <Header icon={<CheckSquare size={12} />} label="Ações" onAdd={() => update("action_items", [...draft.action_items, { title: "", owner: "", due: "" }])} />
        {draft.action_items.length === 0 && <Empty text="Nenhuma ação." />}
        <ul className="space-y-2">
          {draft.action_items.map((a, i) => (
            <li key={i} className="rounded-md border border-border bg-background/40 p-2 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={a.title}
                  placeholder="Descrição da ação"
                  onChange={(e) => {
                    const next = [...draft.action_items];
                    next[i] = { ...next[i], title: e.target.value };
                    update("action_items", next);
                  }}
                />
                <Button size="icon" variant="ghost" onClick={() => update("action_items", draft.action_items.filter((_, j) => j !== i))}>
                  <Trash2 size={14} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={a.owner ?? ""}
                  placeholder="Responsável"
                  onChange={(e) => {
                    const next = [...draft.action_items];
                    next[i] = { ...next[i], owner: e.target.value };
                    update("action_items", next);
                  }}
                />
                <Input
                  value={a.due ?? ""}
                  placeholder="Prazo (ex: 2026-07-10)"
                  onChange={(e) => {
                    const next = [...draft.action_items];
                    next[i] = { ...next[i], due: e.target.value };
                    update("action_items", next);
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Decisions */}
      <Card>
        <Header icon={<Gavel size={12} />} label="Decisões" onAdd={() => update("decisions", [...draft.decisions, ""])} />
        <StringList items={draft.decisions} onChange={(v) => update("decisions", v)} placeholder="Decisão" empty="Nenhuma decisão." />
      </Card>

      {/* Ideas */}
      <Card>
        <Header icon={<Lightbulb size={12} />} label="Ideias" onAdd={() => update("ideas", [...draft.ideas, ""])} />
        <StringList items={draft.ideas} onChange={(v) => update("ideas", v)} placeholder="Ideia" empty="Nenhuma ideia." />
      </Card>

      {/* Alerts */}
      <Card>
        <Header icon={<AlertTriangle size={12} />} label="Alertas" onAdd={() => update("alerts", [...draft.alerts, { text: "", severity: "medium" }])} />
        {draft.alerts.length === 0 && <Empty text="Nenhum alerta." />}
        <ul className="space-y-2">
          {draft.alerts.map((a, i) => (
            <li key={i} className="flex gap-2 items-start">
              <Textarea
                rows={2}
                value={a.text}
                placeholder="Alerta / risco"
                className="flex-1"
                onChange={(e) => {
                  const next = [...draft.alerts];
                  next[i] = { ...next[i], text: e.target.value };
                  update("alerts", next);
                }}
              />
              <Select
                value={a.severity}
                onValueChange={(v) => {
                  const next = [...draft.alerts];
                  next[i] = { ...next[i], severity: v as Alert["severity"] };
                  update("alerts", next);
                }}
              >
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">low</SelectItem>
                  <SelectItem value="medium">medium</SelectItem>
                  <SelectItem value="high">high</SelectItem>
                </SelectContent>
              </Select>
              <Button size="icon" variant="ghost" onClick={() => update("alerts", draft.alerts.filter((_, j) => j !== i))}>
                <Trash2 size={14} />
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Header({ icon, label, onAdd }: { icon: React.ReactNode; label: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        {icon} {label}
      </h3>
      <Button size="sm" variant="ghost" onClick={onAdd}>
        <Plus size={14} className="mr-1" /> Adicionar
      </Button>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-xs text-muted-foreground">{text}</p>;
}

function StringList({
  items, onChange, placeholder, empty,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  empty: string;
}) {
  if (items.length === 0) return <Empty text={empty} />;
  return (
    <ul className="space-y-2">
      {items.map((v, i) => (
        <li key={i} className="flex gap-2">
          <Textarea
            rows={1}
            value={v}
            placeholder={placeholder}
            className="flex-1 min-h-9"
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <Button size="icon" variant="ghost" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <Trash2 size={14} />
          </Button>
        </li>
      ))}
    </ul>
  );
}
