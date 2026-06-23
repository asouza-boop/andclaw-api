import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Calendar, FileText, Folder, MessageSquare } from "lucide-react";
import { globalSearch, type SearchResult } from "@/lib/search.functions";

export function SearchPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchFn = useServerFn(globalSearch);

  useEffect(() => {
    if (!open) { setQ(""); setResults([]); }
  }, [open]);

  useEffect(() => {
    const term = q.trim();
    if (!term) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await searchFn({ data: { q: term } });
        setResults(r);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }, 200);
    return () => clearTimeout(t);
  }, [q, searchFn]);

  function go(r: SearchResult) {
    onOpenChange(false);
    navigate({ to: r.route });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xl gap-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Search size={16} className="text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar em reuniões, conhecimento, projetos, mensagens…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {q.trim() && results.length === 0 && !loading && (
            <p className="px-4 py-8 text-center text-xs text-muted-foreground">Nenhum resultado.</p>
          )}
          {loading && <p className="px-4 py-4 text-center text-xs text-muted-foreground">Buscando…</p>}
          <ul>
            {results.map((r) => {
              const Icon = r.kind === "meeting" ? Calendar
                : r.kind === "knowledge" ? FileText
                : r.kind === "project" ? Folder
                : MessageSquare;
              const label = r.kind === "meeting" ? "Reunião"
                : r.kind === "knowledge" ? "Conhecimento"
                : r.kind === "project" ? "Projeto" : "Mensagem";
              return (
                <li key={`${r.kind}-${r.id}`}>
                  <button
                    onClick={() => go(r)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-overlay text-left border-b border-border/50"
                  >
                    <Icon size={15} className="text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{r.title}</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
                      </div>
                      {r.snippet && <p className="text-xs text-muted-foreground truncate mt-0.5">{r.snippet}</p>}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
