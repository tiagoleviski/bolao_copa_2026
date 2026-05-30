export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-36 bg-white/10 rounded-lg" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="glass rounded-xl h-16" />
      ))}
    </div>
  );
}
