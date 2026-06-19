interface BrandLogoProps {
  mode?: "full" | "icon";
  className?: string;
}

export function BrandLogo({ mode = "full", className = "" }: BrandLogoProps) {
  const src =
    mode === "full" ? "/brand/funciona-agro-logo-full.png" : "/brand/funciona-agro-logo-icon.png";
  const alt = mode === "full" ? "Funciona Agro" : "Funciona Agro ícone";

  return <img src={src} alt={alt} className={className} />;
}
