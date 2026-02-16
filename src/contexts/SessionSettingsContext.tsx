'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { SessionSettings, SessionTemplate } from '@/types'
import type { DbSessionSettings } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

interface SessionSettingsTemplate {
  name: string
  type: SessionTemplate
  description: string
  settings: Partial<SessionSettings>
}

interface SessionSettingsContextType {
  currentSettings: SessionSettings | null
  templates: SessionSettingsTemplate[]
  updateCurrentSettings: (settings: Partial<SessionSettings>) => void
  applyTemplate: (templateType: SessionTemplate) => void
  getActiveSettings: () => SessionSettings
}

const DEFAULT_TEMPLATES: SessionSettingsTemplate[] = [
  {
    name: 'Quick Check-in',
    type: 'quick',
    description: '5-minute focused session without timeouts',
    settings: {
      sessionDuration: 5,
      timeoutsPerPartner: 0,
      timeoutDuration: 0,
      turnBasedMode: false,
      allowExtensions: false,
      warmUpQuestions: false,
      coolDownTime: 0,
    },
  },
  {
    name: 'Standard Session',
    type: 'standard',
    description: '10-minute balanced session with turn-based discussion',
    settings: {
      sessionDuration: 10,
      timeoutsPerPartner: 1,
      timeoutDuration: 2,
      turnBasedMode: true,
      turnDuration: 90,
      allowExtensions: true,
      warmUpQuestions: false,
      coolDownTime: 2,
    },
  },
  {
    name: 'Deep Dive',
    type: 'deep-dive',
    description: '20-minute comprehensive session with warm-up and reflection',
    settings: {
      sessionDuration: 20,
      timeoutsPerPartner: 2,
      timeoutDuration: 3,
      turnBasedMode: true,
      turnDuration: 120,
      allowExtensions: true,
      warmUpQuestions: true,
      coolDownTime: 5,
    },
  },
]

const DEFAULT_SETTINGS: SessionSettings = {
  id: 'default',
  coupleId: '',
  sessionDuration: 10,
  timeoutsPerPartner: 1,
  timeoutDuration: 2,
  turnBasedMode: true,
  turnDuration: 90,
  allowExtensions: true,
  warmUpQuestions: false,
  coolDownTime: 2,
}

function mapDbToSettings(row: DbSessionSettings): SessionSettings {
  return {
    id: row.id,
    coupleId: row.couple_id,
    sessionDuration: row.session_duration,
    timeoutsPerPartner: row.timeouts_per_partner,
    timeoutDuration: row.timeout_duration,
    turnBasedMode: row.turn_based_mode,
    turnDuration: row.turn_duration,
    allowExtensions: row.allow_extensions,
    warmUpQuestions: row.warm_up_questions,
    coolDownTime: row.cool_down_time,
  }
}

const SessionSettingsContext = createContext<SessionSettingsContextType | undefined>(undefined)

interface SessionSettingsProviderProps {
  children: React.ReactNode
  coupleId: string
}

export function SessionSettingsProvider({ children, coupleId }: SessionSettingsProviderProps): React.ReactNode {
  const [currentSettings, setCurrentSettings] = useState<SessionSettings | null>(null)

  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('session_settings')
        .select('*')
        .eq('couple_id', coupleId)
        .maybeSingle()

      if (error) {
        console.error('Failed to load session settings:', error)
        setCurrentSettings({ ...DEFAULT_SETTINGS, coupleId })
        return
      }

      if (data) {
        setCurrentSettings(mapDbToSettings(data))
      } else {
        setCurrentSettings({ ...DEFAULT_SETTINGS, coupleId })
      }
    }
    loadSettings()
  }, [coupleId])

  const updateCurrentSettings = useCallback(
    async (settings: Partial<SessionSettings>) => {
      const updated = { ...currentSettings, ...settings } as SessionSettings
      setCurrentSettings(updated)

      const supabase = createClient()
      await supabase.from('session_settings').upsert({
        id: updated.id === 'default' ? undefined : updated.id,
        couple_id: coupleId,
        session_duration: updated.sessionDuration,
        timeouts_per_partner: updated.timeoutsPerPartner,
        timeout_duration: updated.timeoutDuration,
        turn_based_mode: updated.turnBasedMode,
        turn_duration: updated.turnDuration,
        allow_extensions: updated.allowExtensions,
        warm_up_questions: updated.warmUpQuestions,
        cool_down_time: updated.coolDownTime,
      })
    },
    [currentSettings, coupleId],
  )

  const applyTemplate = useCallback(
    (templateType: SessionTemplate) => {
      const template = DEFAULT_TEMPLATES.find((t) => t.type === templateType)
      if (!template) return
      updateCurrentSettings(template.settings)
    },
    [updateCurrentSettings],
  )

  const getActiveSettings = useCallback((): SessionSettings => {
    return currentSettings || { ...DEFAULT_SETTINGS, coupleId }
  }, [currentSettings, coupleId])

  return (
    <SessionSettingsContext.Provider
      value={{
        currentSettings,
        templates: DEFAULT_TEMPLATES,
        updateCurrentSettings,
        applyTemplate,
        getActiveSettings,
      }}
    >
      {children}
    </SessionSettingsContext.Provider>
  )
}

export function useSessionSettings(): SessionSettingsContextType {
  const context = useContext(SessionSettingsContext)
  if (context === undefined) {
    throw new Error('useSessionSettings must be used within a SessionSettingsProvider')
  }
  return context
}
