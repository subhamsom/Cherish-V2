interface TagPillProps {
    label: string
    onRemove?: () => void
    onClick?: () => void
    selected?: boolean
  }
  
  export function TagPill({ label, onRemove, onClick, selected }: TagPillProps) {
    return (
      <span
        onClick={onClick}
        className={`
          inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm cursor-pointer
          transition-colors select-none
          ${selected
            ? 'bg-zinc-900 text-white border border-zinc-900 shadow-sm'
            : 'bg-white text-zinc-700 border border-zinc-200 shadow-sm hover:bg-zinc-50'}
        `}
      >
        {label}
        {onRemove && (
          <button
            onClick={e => { e.stopPropagation(); onRemove(); }}
            className="ml-1 text-gray-400 hover:text-gray-600 leading-none"
            aria-label={`Remove ${label}`}
          >
            ×
          </button>
        )}
      </span>
    )
  }