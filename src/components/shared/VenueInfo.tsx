interface VenueInfoProps {
  sede: string | null;
  estadio: string | null;
  className?: string;
}

export function VenueInfo({ sede, estadio, className = "" }: VenueInfoProps) {
  if (!sede && !estadio) return null;

  return (
    <span className={`text-xs text-muted-foreground ${className}`}>
      {[sede, estadio].filter(Boolean).join(" · ")}
    </span>
  );
}
