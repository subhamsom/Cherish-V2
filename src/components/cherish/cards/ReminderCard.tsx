import { Clock } from 'lucide-react'

interface ReminderCardProps {
  id: string
  title: string
  note?: string
  date: string
  reminderTime?: string
  urgent?: boolean
  onClick?: () => void
}

function formatReminderDate(dateStr: string, timeStr?: string) {
  const date = new Date(`${dateStr}T00:00:00`)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  let label = ''
  if (date.toDateString() === today.toDateString()) label = 'Today'
  else if (date.toDateString() === tomorrow.toDateString()) label = 'Tomorrow'
  else label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  if (timeStr) {
    const parsedTime = new Date(timeStr)
    const formattedTime = Number.isNaN(parsedTime.getTime())
      ? timeStr
      : parsedTime.toLocaleTimeString('en-IN', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
    label += `, ${formattedTime}`
  }
  return label
}

export function ReminderCard({
  id,
  title,
  note,
  date,
  reminderTime,
  urgent = false,
  onClick,
}: ReminderCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
    >
      <div className={`flex ${urgent ? 'border-l-4 border-[#FF6B6C]' : ''}`}>
        <div className="p-4 flex flex-col gap-1 flex-1">
          <div className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide
            ${urgent ? 'text-[#FF6B6C]' : 'text-gray-400'}`}
          >
            <Clock size={11} />
            {formatReminderDate(date, reminderTime)}
          </div>

          <h3 className="font-serif text-lg font-bold leading-snug text-gray-900">
            {title}
          </h3>

          {note && (
            <p className="text-sm text-zinc-800 line-clamp-2">
              {note}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}