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
            ? 'bg-gray-800 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
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