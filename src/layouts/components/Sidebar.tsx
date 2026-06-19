import { useAuth } from "@/modules/auth/AuthContext";
import { isAppAdmin, isSupportAdmin } from "@/shared/config/permissions";
import { routes } from "@/shared/config/routes";
import { BrandLogo } from "@/shared/ui/components/BrandLogo";
import {
  BadgeCent,
  Building2,
  FileSpreadsheet,
  Home,
  Leaf,
  MapPinned,
  Package,
  Users,
  Warehouse,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const supportItems = [
  { to: routes.tenants, label: "Tenants", icon: Building2 },
  { to: routes.units, label: "Unidades", icon: BadgeCent },
];

const tenantAdminItems = [
  { to: routes.users, label: "Usuários", icon: Users },
  { to: routes.farms, label: "Fazendas", icon: Building2 },
  { to: routes.fields, label: "Talhões", icon: Leaf },
  { to: routes.farmPermissions, label: "Permissões", icon: MapPinned },
  { to: routes.units, label: "Unidades", icon: BadgeCent },
  { to: routes.products, label: "Produtos", icon: Package },
  { to: routes.inventoryLocations, label: "Locais Estoque", icon: Warehouse },
  { to: routes.inventoryBalance, label: "Saldo Estoque", icon: Package },
  { to: routes.reports, label: "Relatórios", icon: FileSpreadsheet },
];

const commonItems = [
  { to: routes.units, label: "Unidades", icon: BadgeCent },
  { to: routes.products, label: "Produtos", icon: Package },
  { to: routes.farms, label: "Fazendas", icon: Building2 },
  { to: routes.fields, label: "Talhões", icon: Leaf },
];

export function Sidebar() {
  const { profile } = useAuth();
  const roleItems = isSupportAdmin(profile)
    ? supportItems
    : isAppAdmin(profile)
      ? tenantAdminItems
      : commonItems;
  const items = [{ to: routes.home, label: "Início", icon: Home }, ...roleItems];

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-shrink-0 overflow-y-auto border-r bg-[hsl(var(--surface))] px-4 py-5 md:flex md:flex-col">
      <div className="mb-8 rounded-[var(--radius-md)] border bg-[hsl(var(--surface-muted))] p-4">
        <BrandLogo mode="full" className="h-10 w-auto" />
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "brand-gradient text-white shadow-[var(--shadow-soft)]"
                    : "text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--surface-muted))] hover:text-[hsl(var(--brand-dark))]"
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto flex items-center gap-3 rounded-[var(--radius-md)] border p-3">
        <BrandLogo mode="icon" className="h-7 w-7" />
        <div>
          <p className="text-xs font-semibold text-[hsl(var(--brand-dark))]">Funciona Agro</p>
          <p className="text-xs text-[hsl(var(--foreground-muted))]">Plataforma de suporte</p>
        </div>
      </div>
    </aside>
  );
}
