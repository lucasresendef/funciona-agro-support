import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="app-shell-bg flex min-h-screen items-center justify-center p-6">
      <AppCard className="max-w-lg text-center">
        <SearchX className="mx-auto text-[hsl(var(--brand-dark))]" size={36} />
        <h1 className="mt-3 text-2xl font-extrabold text-[hsl(var(--brand-dark))]">
          Página não encontrada
        </h1>
        <p className="mt-2 text-sm text-[hsl(var(--foreground-muted))]">
          A rota solicitada não existe ou foi movida.
        </p>
        <AppButton type="button" className="mt-6" onClick={() => navigate("/units")}>
          Voltar para unidades
        </AppButton>
      </AppCard>
    </div>
  );
}
