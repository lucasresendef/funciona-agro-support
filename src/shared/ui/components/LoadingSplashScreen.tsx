import { BrandLogo } from "@/shared/ui/components/BrandLogo";
import { AppCard } from "@/shared/ui/components/AppCard";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const floatingOrbs = [
  {
    className: "left-[-8%] top-[-10%] h-72 w-72 bg-[hsl(var(--brand-light)/0.22)]",
    transition: { duration: 16, repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" as const },
    animate: { y: [0, 28, 0], x: [0, 14, 0] },
  },
  {
    className: "right-[-10%] top-[12%] h-96 w-96 bg-white/18",
    transition: { duration: 18, repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" as const },
    animate: { y: [0, -24, 0], x: [0, -18, 0] },
  },
  {
    className: "bottom-[-18%] left-[18%] h-80 w-80 bg-[hsl(var(--brand)/0.16)]",
    transition: { duration: 20, repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" as const },
    animate: { y: [0, -22, 0], x: [0, 22, 0] },
  },
];

const dots = [0, 1, 2];

export function LoadingSplashScreen() {
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) {
          return current;
        }

        const step = current < 35 ? 8 : current < 68 ? 5 : 2;
        return Math.min(current + step, 92);
      });
    }, 180);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <motion.div
      className="app-shell-bg fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-5 py-8"
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.01, transition: { duration: 0.22, ease: "easeOut" } }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="brand-gradient absolute inset-0 opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,hsl(var(--brand-light)/0.3),transparent_38%),radial-gradient(circle_at_15%_25%,rgba(255,255,255,0.14),transparent_28%),radial-gradient(circle_at_50%_88%,hsl(var(--brand-dark)/0.18),transparent_34%)]" />

      {floatingOrbs.map((orb) => (
        <motion.div
          key={orb.className}
          className={`pointer-events-none absolute rounded-full blur-3xl ${orb.className}`}
          animate={orb.animate}
          transition={orb.transition}
        />
      ))}

      <motion.section
        className="relative z-10 w-full max-w-[26rem]"
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
      >
        <AppCard className="border-white/30 bg-white p-5 shadow-[0_24px_60px_-28px_rgba(10,50,25,0.28)] backdrop-blur sm:p-6">
          <div className="flex flex-col items-center text-center">
            <motion.div
              className="relative flex h-24 w-24 items-center justify-center"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <motion.div
                className="absolute inset-[-18px] rounded-full bg-[radial-gradient(circle,hsl(var(--brand-light)/0.22),transparent_68%)] blur-2xl"
                animate={{ scale: [0.94, 1.08, 0.94], opacity: [0.42, 0.72, 0.42] }}
                transition={{ duration: 4.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <BrandLogo
                mode="icon"
                className="relative z-10 h-24 w-24 object-contain drop-shadow-[0_10px_20px_rgba(10,50,25,0.2)]"
              />
            </motion.div>

            <div className="mt-2 flex flex-col items-center gap-1.5">
              <motion.p
                className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[hsl(var(--brand-dark))]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 }}
              >
                Preparando seu ambiente
              </motion.p>

              <motion.p
                className="max-w-[20rem] text-[0.92rem] leading-6 text-[hsl(var(--foreground-muted))]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16 }}
              >
                Tecnologia que funciona no campo
              </motion.p>
            </div>

            <div
              className="mt-5 w-full"
              role="progressbar"
              aria-label="Carregando Funciona Agro"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              tabIndex={0}
            >
              <div className="h-3 overflow-hidden rounded-full border border-[hsl(var(--brand-light)/0.42)] bg-[hsl(var(--brand-light)/0.1)] p-0.5">
                <motion.div
                  className="relative h-full origin-left overflow-hidden rounded-full bg-[linear-gradient(90deg,hsl(var(--brand-dark))_0%,hsl(var(--brand))_50%,hsl(var(--brand-light))_100%)]"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 w-1/3 bg-white/70 blur-md"
                    animate={{ x: ["-130%", "330%"] }}
                    transition={{
                      duration: 1.8,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2">
                {dots.map((dot) => (
                  <motion.span
                    key={dot}
                    className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-dark))]"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.55, 1, 0.55] }}
                    transition={{
                      duration: 1.15,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: dot * 0.16,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </AppCard>
      </motion.section>
    </motion.div>
  );
}
