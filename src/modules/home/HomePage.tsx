import { useAuth } from "@/modules/auth/AuthContext";
import { isAppAdmin, isSupportAdmin } from "@/shared/config/permissions";
import { routes } from "@/shared/config/routes";
import { BrandLogo } from "@/shared/ui/components/BrandLogo";
import { type Variants, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCent,
  Building2,
  Leaf,
  type LucideIcon,
  MapPinned,
  Package,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Shortcut {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

const supportShortcuts: Shortcut[] = [
  {
    to: routes.tenants,
    label: "Tenants",
    description: "Clientes, usuários e a estrutura de cada operação.",
    icon: Building2,
  },
  {
    to: routes.units,
    label: "Unidades",
    description: "Catálogo global de unidades de medida.",
    icon: BadgeCent,
  },
];

const appShortcuts: Shortcut[] = [
  {
    to: routes.farms,
    label: "Fazendas",
    description: "Cadastro e gestão das suas fazendas.",
    icon: Building2,
  },
  {
    to: routes.fields,
    label: "Talhões",
    description: "Áreas produtivas e seus detalhes.",
    icon: Leaf,
  },
  {
    to: routes.farmPermissions,
    label: "Permissões",
    description: "Quem acessa cada fazenda e com qual papel.",
    icon: MapPinned,
  },
  {
    to: routes.inventoryBalance,
    label: "Estoque",
    description: "Saldo de insumos por local.",
    icon: Package,
  },
];

const viewerShortcuts: Shortcut[] = [
  {
    to: routes.units,
    label: "Unidades",
    description: "Catálogo de unidades de medida.",
    icon: BadgeCent,
  },
];

const highlights = [
  { icon: Leaf, label: "Do campo à gestão" },
  { icon: Package, label: "Insumos sob controle" },
  { icon: TrendingUp, label: "Decisões com dados" },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function HomePage() {
  const { profile } = useAuth();

  const displayName =
    profile?.authUser.name ?? profile?.authUser.preferredUsername ?? profile?.authUser.email ?? "";
  const firstName = displayName.split(" ")[0] || "boas-vindas";

  const roleLabel = isSupportAdmin(profile)
    ? "Administração da plataforma"
    : isAppAdmin(profile)
      ? "Administração da operação"
      : "Acesso à plataforma";

  const shortcuts = isSupportAdmin(profile)
    ? supportShortcuts
    : isAppAdmin(profile)
      ? appShortcuts
      : viewerShortcuts;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-6xl space-y-6"
    >
      <motion.section
        variants={item}
        className="brand-gradient relative overflow-hidden rounded-[var(--radius-lg)] p-8 text-white shadow-[var(--shadow-card)] md:p-10"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[hsl(var(--brand-light))]/20 blur-2xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        <div className="relative">
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur"
          >
            <Sparkles size={14} />
            {roleLabel}
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-5 text-3xl font-extrabold leading-tight md:text-4xl"
          >
            Bem-vindo à Funciona Agro,
            <br />
            <span className="text-[hsl(var(--brand-light))]">{firstName}</span>.
          </motion.h1>

          <motion.p variants={item} className="mt-3 max-w-xl text-sm text-white/80 md:text-base">
            Tecnologia que funciona no campo, do talhão ao estoque, da operação à decisão. Tudo em
            um só lugar.
          </motion.p>

          <motion.div variants={item} className="mt-7 flex flex-wrap gap-2">
            {highlights.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <span
                  key={highlight.label}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur"
                >
                  <Icon size={14} />
                  {highlight.label}
                </span>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      <motion.div variants={item} className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[hsl(var(--brand-dark))]">Atalhos para você</h2>
        <BrandLogo mode="icon" className="h-7 w-7 opacity-70" />
      </motion.div>

      <motion.div
        variants={container}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <motion.div key={shortcut.to} variants={item} whileHover={{ y: -4 }}>
              <Link
                to={shortcut.to}
                className="group flex h-full flex-col rounded-[var(--radius-lg)] border bg-[hsl(var(--surface))] p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center justify-between">
                  <span className="brand-gradient inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-white">
                    <Icon size={20} />
                  </span>
                  <ArrowRight
                    size={18}
                    className="text-[hsl(var(--foreground-muted))] transition-transform group-hover:translate-x-1 group-hover:text-[hsl(var(--brand))]"
                  />
                </div>
                <h3 className="mt-4 text-base font-bold text-[hsl(var(--brand-dark))]">
                  {shortcut.label}
                </h3>
                <p className="mt-1 text-sm text-[hsl(var(--foreground-muted))]">
                  {shortcut.description}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
