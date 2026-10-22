import GlassCard from '../ui/GlassCard'

export default function PhETPanel({ label, simulationUrl, suggestions = [] }) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
          Interactive simulation
        </h3>
        <span className="rounded-full bg-[var(--qv-accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--qv-accent)]">
          PhET
        </span>
      </div>
      {simulationUrl ? (
        <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
          <iframe
            title="PhET simulation"
            src={simulationUrl}
            className="h-full w-full"
            loading="lazy"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-dashed border-white/15 bg-slate-950/40 p-4">
          <p className="text-sm text-slate-300">No exact simulation match. Try one of these related simulations:</p>
          {suggestions.length ? (
            <div className="space-y-2">
              {suggestions.map((item, index) => (
                <a
                  key={`${item.runUrl}-${index}`}
                  href={item.runUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 transition hover:border-[var(--qv-accent)]/45 hover:bg-[var(--qv-accent-soft)]"
                >
                  {item.title}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No related PhET suggestions found for this topic.</p>
          )}
        </div>
      )}
      {label ? <p className="mt-2 text-xs text-slate-500">{label}</p> : null}
    </GlassCard>
  )
}
