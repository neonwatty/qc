import { cn } from '@/lib/utils'

type NotePrivacy = 'private' | 'shared' | 'draft'

type Props = {
  privacy: NotePrivacy
  compact?: boolean
  className?: string
}

const CONFIG: Record<NotePrivacy, { label: string; color: string }> = {
  shared: { label: 'Shared', color: 'bg-green-100 text-green-800 border-green-200' },
  private: { label: 'Private', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  draft: { label: 'Draft', color: 'bg-orange-100 text-orange-800 border-orange-200' },
}

export function PrivacyBadge({ privacy, compact = false, className }: Props) {
  // eslint-disable-next-line security/detect-object-injection -- privacy is typed as NotePrivacy union ('private' | 'shared' | 'draft')
  const { label, color } = CONFIG[privacy]

  return (
    <span
      className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', color, className)}
    >
      {compact ? label[0] : label}
    </span>
  )
}
