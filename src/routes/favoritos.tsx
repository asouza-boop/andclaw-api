import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/shell/PageHeader";
import { Bookmark } from "lucide-react";

export const Route = createFileRoute("/favoritos")({
  head: () => ({ meta: [{ title: "Favoritos — AndClaw" }, { name: "description", content: "Itens marcados como favoritos." }] }),
  component: FavoritosPage,
});

const favs = [
  "Playbook: triagem de inbox", "Decisões — Atlas Q4", "Prompt: research deep-dive",
  "Notas reunião kickoff Lumen", "Spec: skill meeting.digest", "Lista de leitura RAG",
];

function FavoritosPage() {
  return (
    <>
      <PageHeader title="Favoritos" description="Itens marcados para acesso rápido." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {favs.map((f) => (
          <Card key={f} className="flex items-center gap-3 hover:border-primary-dim transition cursor-pointer">
            <Bookmark size={16} className="text-warning"/>
            <span className="text-sm">{f}</span>
          </Card>
        ))}
      </div>
    </>
  );
}
