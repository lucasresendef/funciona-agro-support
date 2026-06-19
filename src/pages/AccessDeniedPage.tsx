import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { routes } from "@/shared/config/routes";
import { useAuth } from "@/modules/auth/AuthContext";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AccessDeniedPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  async function handleLogoutAndLoginAgain() {
    await logout();
    navigate(routes.login, { replace: true });
  }

  return (
    <div className="app-shell-bg flex min-h-screen items-center justify-center p-6">
      <AppCard className="max-w-lg text-center">
        <ShieldAlert className="mx-auto text-[hsl(var(--brand-dark))]" size={36} />
        <h1 className="mt-3 text-2xl font-extrabold text-[hsl(var(--brand-dark))]">
          Acesso negado
        </h1>
        <p className="mt-2 text-sm text-[hsl(var(--foreground-muted))]">
          Você não possui permissão para visualizar esta área.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <AppButton type="button" variant="ghost" onClick={() => navigate(routes.home)}>
            Voltar para o início
          </AppButton>
          <AppButton type="button" onClick={() => void handleLogoutAndLoginAgain()}>
            Sair e logar novamente
          </AppButton>
        </div>
      </AppCard>
    </div>
  );
}
