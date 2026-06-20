import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/shell/PageHeader";
import { Archive } from "lucide-react";

export const Route = createFileRoute("/arquivo")({
  head: () => ({ meta: [{ title: "Arquivo — AndClaw" }, { name: "description", content: "Itens arquivados." }] }),
  component: ArquivoPage,
});

function ArquivoPage() {
  return (
    <>
      <PageHeader title="Arquivo" description="Itens arquivados — fora do fluxo ativo, ainda pesquisáveis." />
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <Archive size={32} className="text-muted-foreground mb-3"/>
        <p className="text-sm text-muted-foreground">Nada arquivado nos últimos 30 dias.</p>
      </Card>
    </>
  );
}
