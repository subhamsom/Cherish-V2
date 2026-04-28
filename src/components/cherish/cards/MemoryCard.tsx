import { TagPill } from '@/components/cherish/common/TagPill'

interface MemoryCardProps {
  title: string
  content?: string
  memoryDate: string
  tags?: string[]
  imageUrl?: string
  onClick?: () => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function MemoryCard({
  title,
  content,
  memoryDate,
  tags = [],
  imageUrl,
  onClick,
}: MemoryCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
    >
      {imageUrl && (
        <div className="w-full aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4 flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {formatDate(memoryDate)}
        </p>

        <h3 className="font-serif font-bold text-gray-900 text-lg leading-snug">
          {title}
        </h3>

        {content && (
          <p className="text-sm text-zinc-800 line-clamp-2 leading-relaxed">
            {content}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tags.map(tag => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}