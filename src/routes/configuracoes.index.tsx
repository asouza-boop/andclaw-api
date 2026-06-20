import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/configuracoes/")({
  component: ConfigGeral,
});

function ConfigGeral() {
  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <h3 className="text-sm font-semibold mb-3">Perfil</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nome" value="Alessandro Souza"/>
          <Field label="Email" value="alessandro@andclaw.dev"/>
          <Field label="Fuso" value="America/Sao_Paulo"/>
          <Field label="Idioma" value="Português (BR)"/>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-semibold mb-3">Preferências</h3>
        <Toggle label="Notificações Telegram" on/>
        <Toggle label="Resumo diário por email" on/>
        <Toggle label="Modo experimental"/>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input defaultValue={value} className="mt-1 w-full h-9 px-3 rounded-lg bg-surface border border-border text-sm outline-none focus:border-primary"/>
    </label>
  );
}

function Toggle({ label, on }: { label: string; on?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm">{label}</span>
      <span className={`h-5 w-9 rounded-full p-0.5 transition ${on ? "bg-primary" : "bg-surface border border-border"}`}>
        <span className={`block h-4 w-4 rounded-full bg-background transition ${on ? "translate-x-4" : ""}`}/>
      </span>
    </div>
  );
}
