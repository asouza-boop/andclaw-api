import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — AndClaw" }, { name: "description", content: "Preferências, perfil e provedores conectados." }] }),
  component: ConfigLayout,
});

const tabs: { to: "/configuracoes" | "/configuracoes/providers"; label: string; exact?: boolean }[] = [
  { to: "/configuracoes", label: "Geral", exact: true },
  { to: "/configuracoes/providers", label: "Provedores" },
];

function ConfigLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      <PageHeader title="Configurações" description="Preferências do workspace e integrações conectadas." />
      <div className="flex gap-1 border-b border-border mb-6">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          return (
            <Link key={t.to} to={t.to}
              className={[
                "px-4 py-2 text-sm border-b-2 -mb-px transition",
                active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              ].join(" ")}>
              {t.label}
            </Link>
          );
        })}
      </div>
      <Outlet/>
    </>
  );
}
