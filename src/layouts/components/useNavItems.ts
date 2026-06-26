import { useAuth } from "@/modules/auth/AuthContext";
import { isAppAdmin, isSupportAdmin } from "@/shared/config/permissions";
import { routes } from "@/shared/config/routes";
import {
  BadgeCent,
  Building2,
  FileBarChart2,
  FileSpreadsheet,
  Home,
  LayoutDashboard,
  Leaf,
  type LucideIcon,
  MapPinned,
  Package,
  Tractor,
  Users,
  Warehouse,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const supportItems: NavItem[] = [
  { to: routes.tenants, label: "Tenants", icon: Building2 },
  { to: routes.units, label: "Unidades", icon: BadgeCent },
];

const tenantAdminItems: NavItem[] = [
  { to: routes.users, label: "Usuários", icon: Users },
  { to: routes.farms, label: "Fazendas", icon: Building2 },
  { to: routes.fields, label: "Talhões", icon: Leaf },
  { to: routes.operations, label: "Operações", icon: Tractor },
  { to: routes.metrics, label: "Métricas", icon: LayoutDashboard },
  { to: routes.fieldReport, label: "Relatório Talhão", icon: FileBarChart2 },
  { to: routes.farmPermissions, label: "Permissões", icon: MapPinned },
  { to: routes.units, label: "Unidades", icon: BadgeCent },
  { to: routes.products, label: "Produtos", icon: Package },
  { to: routes.inventoryLocations, label: "Locais Estoque", icon: Warehouse },
  { to: routes.inventoryBalance, label: "Saldo Estoque", icon: Package },
  { to: routes.reports, label: "Relatórios", icon: FileSpreadsheet },
];

const commonItems: NavItem[] = [
  { to: routes.units, label: "Unidades", icon: BadgeCent },
  { to: routes.products, label: "Produtos", icon: Package },
  { to: routes.farms, label: "Fazendas", icon: Building2 },
  { to: routes.fields, label: "Talhões", icon: Leaf },
  { to: routes.operations, label: "Operações", icon: Tractor },
  { to: routes.metrics, label: "Métricas", icon: LayoutDashboard },
  { to: routes.fieldReport, label: "Relatório Talhão", icon: FileBarChart2 },
];

export function useNavItems(): NavItem[] {
  const { profile } = useAuth();
  const roleItems = isSupportAdmin(profile)
    ? supportItems
    : isAppAdmin(profile)
      ? tenantAdminItems
      : commonItems;
  return [{ to: routes.home, label: "Início", icon: Home }, ...roleItems];
}
