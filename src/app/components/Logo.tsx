import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import ambiIcon from "@/imports/Ambi_icon.png";
import ambiLogoFull from "@/imports/Ambi_logo_full.png";

/** Icon-only mark — use for the sidebar, avatars, favicons, anywhere small/circular. */
export function Logo({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <ImageWithFallback
      src={ambiIcon}
      alt="Ambi-Tech"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Full lockup (icon + wordmark) — use for the login screen or any wide branded header. */
export function LogoFull({ height = 64, className = "" }: { height?: number; className?: string }) {
  return (
    <ImageWithFallback
      src={ambiLogoFull}
      alt="Ambi-Tech"
      height={height}
      className={`object-contain ${className}`}
      style={{ height }}
    />
  );
}