import { useRouterState } from "@tanstack/react-router";
import { Search, Bell, Command } from "lucide-react";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/inbox": "Inbox",
  "/chat": "Chat",
  "/agenda": "Agenda",
  "/projetos": "Projetos",
  "/agentes": "Agentes",
  "/skills": "Skills",
  "/reunioes": "Reuniões",
  "/aprendizado": "Inteligência",
  "/evolucao": "Evolução",
  "/favoritos": "Favoritos",
  "/conhecimento": "Conhecimento",
  "/arquivo": "Arquivo",
  "/configuracoes": "Configurações",
  "/configuracoes/providers": "Provedores",
};

export function Topbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = titles[pathname] ?? "AndClaw";

  return (
    <header className="h-14 flex items-center justify-between gap-4 px-5 md:px-8 border-b border-border glass">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-base font-semibold truncate">{title}</h1>
        <span className="text-xs text-muted-foreground hidden sm:inline">/ workspace</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-lg bg-surface/60 border border-border w-72 text-sm text-muted-foreground">
          <Search size={14} />
          <span className="flex-1">Buscar ou comando…</span>
          <kbd className="text-[10px] inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-overlay border border-border">
            <Command size={10} />K
          </kbd>
        </div>
        <button className="relative h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border hover:bg-overlay transition-colors">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-cyan flex items-center justify-center text-xs font-semibold text-primary-foreground">
          AS
        </div>
      </div>
    </header>
  );
}
