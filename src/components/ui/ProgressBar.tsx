interface ProgressBarProps {
  ratio: number
  label: string
}

export function ProgressBar({ ratio, label }: ProgressBarProps) {
  const percent = Math.floor(Math.min(Math.max(ratio, 0), 1) * 100)

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="h-4 w-full overflow-hidden rounded-full bg-slate-200"
    >
      <div
        className="h-full rounded-full bg-emerald-600 transition-[width]"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
