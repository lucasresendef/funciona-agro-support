import { routes } from "@/shared/config/routes";
import { AppButton } from "@/shared/ui/components/AppButton";
import { AppCard } from "@/shared/ui/components/AppCard";
import { BrandLogo } from "@/shared/ui/components/BrandLogo";
import { LogIn } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={routes.home} replace />;
  }

  return (
    <section className="fade-up relative flex min-h-screen w-full items-center justify-center overflow-hidden p-5">
      <div className="brand-gradient absolute inset-0 opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,hsl(var(--brand-light)/0.35),transparent_40%)]" />

      <AppCard className="relative z-10 w-full max-w-md border-white/30 bg-white/95 p-8 backdrop-blur">
        <BrandLogo mode="full" className="mx-auto mb-6 h-12 w-auto" />
        <p className="mb-1 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--brand-dark))]">
          Suporte Administrativo
        </p>
        <h1 className="text-center text-2xl font-extrabold text-[hsl(var(--brand-dark))]">
          Entrar na plataforma
        </h1>
        <p className="mb-7 mt-2 text-center text-sm text-[hsl(var(--foreground-muted))]">
          Tecnologia que funciona no campo
        </p>

        <AppButton type="button" className="w-full" onClick={() => void login()}>
          <LogIn size={16} />
          Entrar
        </AppButton>
      </AppCard>
    </section>
  );
}
