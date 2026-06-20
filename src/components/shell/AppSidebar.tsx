import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Inbox, MessageSquare, Calendar,
  FolderOpen, Bot, Zap, Target, Radio,
  Bookmark, BookOpen, Archive, Settings, LogOut, Activity,
} from "lucide-react";

const ClawLogo = () => (
  <svg viewBox="0 0 100 100" width="28" height="28" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 drop-shadow-[0_2px_6px_rgba(232,72,75,0.4)]">
    <path d="M 35 25 Q 20 10 25 5" stroke="#E8484B" strokeWidth="4" fill="transparent" strokeLinecap="round"/>
    <path d="M 65 25 Q 80 10 75 5" stroke="#E8484B" strokeWidth="4" fill="transparent" strokeLinecap="round"/>
    <ellipse cx="10" cy="50" rx="12" ry="10" fill="#E8484B" transform="rotate(-20 10 50)" />
    <ellipse cx="90" cy="50" rx="12" ry="10" fill="#E8484B" transform="rotate(20 90 50)" />
    <circle cx="50" cy="50" r="42" fill="#E8484B" />
    <path d="M 35 85 L 35 98 L 45 98 L 45 85" fill="#E8484B" />
    <path d="M 55 85 L 55 98 L 65 98 L 65 85" fill="#E8484B" />
    <circle cx="35" cy="40" r="8" fill="#0B131E" />
    <circle cx="65" cy="40" r="8" fill="#0B131E" />
    <circle cx="35" cy="40" r="3" fill="#00E5FF" />
    <circle cx="65" cy="40" r="3" fill="#00E5FF" />
  </svg>
);

const sections = [
  {
    label: "PRINCIPAL",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", to: "/" },
      { icon: Inbox, label: "Inbox", to: "/inbox", badge: 4 },
      { icon: MessageSquare, label: "Chat", to: "/chat" },
      { icon: Calendar, label: "Agenda", to: "/agenda" },
    ],
  },
  {
    label: "TRABALHO",
    items: [
      { icon: FolderOpen, label: "Projetos", to: "/projetos" },
      { icon: Bot, label: "Agentes", to: "/agentes" },
      { icon: Zap, label: "Skills", to: "/skills" },
      { icon: Target, label: "Reuniões", to: "/reunioes" },
      { icon: Radio, label: "Inteligência", to: "/aprendizado" },
      { icon: Activity, label: "Evolução", to: "/evolucao" },
    ],
  },
  {
    label: "BIBLIOTECA",
    items: [
      { icon: Bookmark, label: "Favoritos", to: "/favoritos" },
      { icon: BookOpen, label: "Conhecimento", to: "/conhecimento" },
      { icon: Archive, label: "Arquivo", to: "/arquivo" },
    ],
  },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 h-14 px-5 flex-shrink-0">
        <ClawLogo />
        <span className="text-sm font-semibold tracking-wide">AndClaw AI</span>
      </div>

      <nav className="flex-1 overflow-y-auto pb-2">
        {sections.map((section) => (
          <div key={section.label} className="mb-1">
            <p className="px-5 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5 px-2">
              {section.items.map((item) => {
                const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                const Icon = item.icon;
                const badge = "badge" in item ? item.badge : undefined;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={[
                      "group flex items-center gap-2.5 h-8 px-3 rounded-lg text-sm transition-colors",
                      active
                        ? "bg-primary-soft text-sidebar-accent-foreground border border-primary-dim/60 font-medium"
                        : "text-sidebar-foreground hover:bg-overlay hover:text-foreground border border-transparent",
                    ].join(" ")}
                  >
                    <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                    <span className="flex-1">{item.label}</span>
                    {badge ? (
                      <span className="text-[10px] h-[18px] px-1.5 rounded-full bg-primary text-primary-foreground inline-flex items-center">
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-2 flex flex-col gap-0.5">
        <Link
          to="/configuracoes"
          className={[
            "flex items-center gap-2.5 h-8 px-3 rounded-lg text-sm transition-colors border border-transparent",
            pathname.startsWith("/configuracoes")
              ? "bg-primary-soft text-sidebar-accent-foreground border-primary-dim/60 font-medium"
              : "text-sidebar-foreground hover:bg-overlay hover:text-foreground",
          ].join(" ")}
        >
          <Settings size={15} />
          <span>Configurações</span>
        </Link>
        <button className="flex items-center gap-2.5 h-8 px-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors text-left">
          <LogOut size={15} />
          <span>Encerrar Sessão</span>
        </button>
      </div>
    </div>
  );
}
