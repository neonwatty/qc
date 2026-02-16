'use client'

import type { ReactNode } from 'react'
import { Heart, Lock, Share2, Trash2, Pencil } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { LoveLanguage } from '@/types'

// --- Category display config ---

const CATEGORY_LABELS: Record<string, string> = {
  words: 'Words of Affirmation',
  acts: 'Acts of Service',
  gifts: 'Receiving Gifts',
  time: 'Quality Time',
  touch: 'Physical Touch',
  custom: 'Custom',
}

const IMPORTANCE_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  essential: 'bg-red-100 text-red-700',
}

// --- Props ---

interface LanguageCardProps {
  language: LoveLanguage
  isOwn: boolean
  onEdit?: (language: LoveLanguage) => void
  onDelete?: (id: string) => void
}

export function LanguageCard({
  language,
  isOwn,
  onEdit,
  onDelete,
}: LanguageCardProps): ReactNode {
  const categoryLabel = CATEGORY_LABELS[language.category] ?? language.category
  const importanceColor = IMPORTANCE_COLORS[language.importance] ?? IMPORTANCE_COLORS.low

  return (
    <Card variant="elevated" className="group relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-400" />
            <CardTitle className="text-base">{language.title}</CardTitle>
          </div>

          <div className="flex items-center gap-1.5">
            {language.privacy === 'private' ? (
              <Badge variant="outline" className="gap-1 text-xs">
                <Lock className="h-3 w-3" />
                Private
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Share2 className="h-3 w-3" />
                Shared
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs">
            {categoryLabel}
          </Badge>
          <Badge className={cn('text-xs', importanceColor)}>
            {language.importance}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {language.description && (
          <p className="mb-3 text-sm text-muted-foreground">{language.description}</p>
        )}

        {language.examples.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Examples</p>
            <ul className="space-y-1">
              {language.examples.map((example, i) => (
                <li key={i} className="text-sm text-foreground">
                  &bull; {example}
                </li>
              ))}
            </ul>
          </div>
        )}

        {language.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {language.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {isOwn && (
          <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(language)}
                className="gap-1"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(language.id)}
                className="gap-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
