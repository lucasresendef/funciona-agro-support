import { BrandLogo } from "@/shared/ui/components/BrandLogo";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavItems } from "./useNavItems";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const items = useNavItems();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Abrir menu de navegação"
          className="group inline-flex items-center gap-1 rounded-[var(--radius-md)] p-1 transition hover:bg-[hsl(var(--surface-muted))] md:hidden"
        >
          <BrandLogo mode="icon" className="h-8 w-8" />
          <ChevronDown
            size={14}
            className={`text-[hsl(var(--foreground-muted))] transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </Dialog.Trigger>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-[hsl(var(--brand-dark))]/45 backdrop-blur-sm md:hidden"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", ease: "easeOut", duration: 0.28 }}
                className="fixed left-0 top-0 z-50 flex h-full w-72 max-w-[82vw] flex-col overflow-y-auto border-r bg-[hsl(var(--surface))] p-4 shadow-[var(--shadow-card)] focus:outline-none md:hidden"
              >
                <div className="mb-4 flex items-center justify-between">
                  <BrandLogo mode="full" className="h-9 w-auto" />
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Fechar menu"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[hsl(var(--foreground-muted))] transition hover:bg-[hsl(var(--surface-muted))]"
                    >
                      <X size={18} />
                    </button>
                  </Dialog.Close>
                </div>
                <Dialog.Title className="sr-only">Menu de navegação</Dialog.Title>
                <nav className="space-y-1.5">
                  {items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.to}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * index + 0.05, duration: 0.2 }}
                      >
                        <NavLink
                          to={item.to}
                          onClick={() => setOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-semibold transition-all ${
                              isActive
                                ? "brand-gradient text-white shadow-[var(--shadow-soft)]"
                                : "text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--surface-muted))] hover:text-[hsl(var(--brand-dark))]"
                            }`
                          }
                        >
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </NavLink>
                      </motion.div>
                    );
                  })}
                </nav>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
