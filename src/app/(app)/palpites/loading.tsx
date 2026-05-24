export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-white/10 rounded-lg" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-7 w-32 bg-white/10 rounded-lg" />
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="glass rounded-xl h-20" />
          ))}
        </div>
      ))}
    </div>
  );
}
