import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import ambiLogo from "@/imports/Ambi_logo.jpeg";

export function Logo({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <ImageWithFallback
      src={ambiLogo}
      alt="Ambi-Tech logo"
      width={size}
      height={size}
      className={`object-contain rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
