import { Heart } from 'lucide-react'
import { TagPill } from '@/components/cherish/common/TagPill'

interface MemoryCardProps {
  id: string
  title: string
  content?: string
  memoryDate: string
  tags?: string[]
  imageUrl?: string
  liked?: boolean
  onClick?: () => void
  onLike?: () => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function MemoryCard({
  id,
  title,
  content,
  memoryDate,
  tags = [],
  imageUrl,
  liked = false,
  onClick,
  onLike,
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
        <p className="text-xs text-gray-400 uppercase tracking-wide">
          {formatDate(memoryDate)}
        </p>

        <h3 className="font-serif font-bold text-gray-900 text-lg leading-snug">
          {title}
        </h3>

        {content && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
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

        <div className="flex items-center justify-end mt-2">
          <button
            onClick={e => { e.stopPropagation(); onLike?.(); }}
            className="text-gray-300 hover:text-red-400 transition-colors"
            aria-label="Like"
          >
            <Heart
              size={18}
              className={liked ? 'fill-red-400 text-red-400' : ''}
            />
          </button>
        </div>
      </div>
    </div>
  )
}