'use client'

import { useState, useCallback, useEffect } from 'react'
import { Check, RotateCcw } from 'lucide-react'

import { updatePersonalization } from '@/app/(app)/settings/actions/personalization'
import { Button } from '@/components/ui/button'

const COLOR_PRESETS = [
  { name: 'Pink', value: 'pink', hsl: '346 77% 55%' },
  { name: 'Blue', value: 'blue', hsl: '217 91% 60%' },
  { name: 'Green', value: 'green', hsl: '142 71% 45%' },
  { name: 'Purple', value: 'purple', hsl: '271 81% 56%' },
  { name: 'Orange', value: 'orange', hsl: '25 95% 53%' },
  { name: 'Teal', value: 'teal', hsl: '173 80% 40%' },
] as const

const FONT_SIZES = [
  { label: 'Small', value: 'small' as const, css: '14px' },
  { label: 'Medium', value: 'medium' as const, css: '16px' },
  { label: 'Large', value: 'large' as const, css: '18px' },
]

interface PersonalizationPanelProps {
  coupleId: string
  currentSettings: {
    primaryColor?: string
    fontSize?: string
    highContrast?: boolean
    reducedMotion?: boolean
  }
}

function applyPersonalization(settings: PersonalizationPanelProps['currentSettings']): void {
  if (typeof window === 'undefined') return
  const root = document.documentElement
  const color = COLOR_PRESETS.find((c) => c.value === settings.primaryColor)
  if (color) root.style.setProperty('--primary', color.hsl)
  const font = FONT_SIZES.find((f) => f.value === settings.fontSize)
  if (font) root.style.setProperty('--font-size-base', font.css)
  root.classList.toggle('high-contrast', settings.highContrast === true)
  root.classList.toggle('reduce-motion', settings.reducedMotion === true)
}

export function PersonalizationPanel({ currentSettings }: PersonalizationPanelProps): React.ReactElement {
  const [primaryColor, setPrimaryColor] = useState(currentSettings.primaryColor ?? 'pink')
  const [fontSize, setFontSize] = useState(currentSettings.fontSize ?? 'medium')
  const [highContrast, setHighContrast] = useState(currentSettings.highContrast ?? false)
  const [reducedMotion, setReducedMotion] = useState(currentSettings.reducedMotion ?? false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    applyPersonalization({ primaryColor, fontSize, highContrast, reducedMotion })
  }, [primaryColor, fontSize, highContrast, reducedMotion])

  const save = useCallback(async (updates: Record<string, unknown>) => {
    setSaving(true)
    await updatePersonalization(updates)
    setSaving(false)
  }, [])

  const handleColorChange = useCallback(
    (value: string) => {
      setPrimaryColor(value)
      save({ primaryColor: value })
    },
    [save],
  )

  const handleFontChange = useCallback(
    (value: string) => {
      setFontSize(value)
      save({ fontSize: value })
    },
    [save],
  )

  const handleReset = useCallback(() => {
    setPrimaryColor('pink')
    setFontSize('medium')
    setHighContrast(false)
    setReducedMotion(false)
    save({ primaryColor: 'pink', fontSize: 'medium', highContrast: false, reducedMotion: false })
  }, [save])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Personalization</h3>
        <p className="text-sm text-muted-foreground">Customize colors, text size, and accessibility.</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Primary Color</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c.value}
              onClick={() => handleColorChange(c.value)}
              className={`relative h-10 w-10 rounded-full border-2 transition-all ${
                primaryColor === c.value ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: `hsl(${c.hsl})` }}
              aria-label={c.name}
            >
              {primaryColor === c.value && <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Text Size</p>
        <div className="flex gap-2">
          {FONT_SIZES.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFontChange(f.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                fontSize === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Accessibility</p>
        <label className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">High Contrast</span>
          <input
            type="checkbox"
            checked={highContrast}
            onChange={(e) => {
              setHighContrast(e.target.checked)
              save({ highContrast: e.target.checked })
            }}
            className="h-4 w-4 rounded border-border"
          />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Reduce Motion</span>
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => {
              setReducedMotion(e.target.checked)
              save({ reducedMotion: e.target.checked })
            }}
            className="h-4 w-4 rounded border-border"
          />
        </label>
      </div>

      <Button variant="outline" size="sm" onClick={handleReset} disabled={saving}>
        <RotateCcw className="h-4 w-4 mr-1" />
        Reset to Defaults
      </Button>
    </div>
  )
}
