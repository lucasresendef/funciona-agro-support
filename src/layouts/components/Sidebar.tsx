import { BrandLogo } from "@/shared/ui/components/BrandLogo";
import { NavLink } from "react-router-dom";
import { useNavItems } from "./useNavItems";

export function Sidebar() {
  const items = useNavItems();

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
