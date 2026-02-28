'use client'

import { Sun, Moon } from 'lucide-react'

import { useTheme } from '@/contexts/ThemeContext'

const THEMES = [
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
]

export function ThemeSelector(): React.ReactElement {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Appearance</h3>
        <p className="text-sm text-muted-foreground">Choose how QC looks for you.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((t) => {
          const Icon = t.icon
          const isActive = theme === t.value
          return (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                isActive ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <div className={`rounded-full p-2 ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
