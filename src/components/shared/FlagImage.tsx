import Image from "next/image";

interface FlagImageProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function FlagImage({
  src,
  alt,
  size = 32,
  className = "",
}: FlagImageProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-sm flex-shrink-0 ${className}`}
      style={{ width: size, height: size * 0.67 }}
    >
      <Image src={src} alt={alt} fill className="object-cover" unoptimized />
    </div>
  );
}
