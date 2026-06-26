import { useAuth } from "@/modules/auth/AuthContext";
import { AppButton } from "@/shared/ui/components/AppButton";
import { MobileNav } from "./MobileNav";

export function Topbar() {
  const { profile, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-[hsl(var(--surface))/0.92] px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <MobileNav />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--foreground-muted))]">
            Tecnologia que funciona no campo
          </p>
          <p className="text-sm font-bold text-[hsl(var(--brand-dark))]">Painel Administrativo</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <p className="hidden text-sm text-[hsl(var(--foreground-muted))] md:block">
          {profile?.authUser.email ?? "usuário"}
        </p>
        <AppButton type="button" variant="secondary" className="h-9 px-3" onClick={() => logout()}>
          Sair
        </AppButton>
      </div>
    </header>
  );
}
