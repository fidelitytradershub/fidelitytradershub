import Image from "next/image";

type BrandLogoProps = {
  compact?: boolean;
  priority?: boolean;
  className?: string;
};

export default function BrandLogo({
  compact = false,
  priority = false,
  className = "",
}: BrandLogoProps) {
  if (compact) {
    return (
      <span
        className={`relative block h-11 w-11 shrink-0 ${className}`}
      >
        {/* LIGHT MODE */}
        <Image
          src="/fidelity-mark-light.png"
          alt="Fidelity"
          fill
          priority={priority}
          sizes="44px"
          className="brand-logo-light object-contain"
        />

        {/* DARK MODE */}
        <Image
          src="/fidelity-mark-dark.png"
          alt="Fidelity"
          fill
          priority={priority}
          sizes="44px"
          className="brand-logo-dark object-contain"
        />
      </span>
    );
  }

  return (
    <span
      className={`relative block h-[58px] w-[205px] shrink-0 ${className}`}
    >
      {/* LIGHT — PURPLE */}
      <Image
        src="/fidelity-wordmark-light.png"
        alt="Fidelity"
        fill
        priority={priority}
        sizes="205px"
        className="brand-logo-light object-contain object-left"
      />

      {/* DARK — NEON LIME */}
      <Image
        src="/fidelity-wordmark-dark.png"
        alt="Fidelity"
        fill
        priority={priority}
        sizes="205px"
        className="brand-logo-dark object-contain object-left"
      />
    </span>
  );
}