'use client'

import { useActionState, useState } from 'react'
import { Timer } from 'lucide-react'

import type { DbSessionSettings } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { updateSessionSettings } from '@/app/(app)/settings/actions'

interface SessionSettingsPanelProps {
  settings: DbSessionSettings | null
  hasCoupleId: boolean
}

const DEFAULTS: Omit<DbSessionSettings, 'id' | 'couple_id'> = {
  session_duration: 30,
  timeouts_per_partner: 2,
  timeout_duration: 3,
  turn_based_mode: false,
  turn_duration: 5,
  allow_extensions: true,
  warm_up_questions: true,
  cool_down_time: 5,
}

function sessionAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  return updateSessionSettings(formData)
}

export function SessionSettingsPanel({
  settings,
  hasCoupleId,
}: SessionSettingsPanelProps) {
  const s = settings ?? DEFAULTS

  const [sessionDuration, setSessionDuration] = useState(s.session_duration)
  const [timeoutsPerPartner, setTimeoutsPerPartner] = useState(
    s.timeouts_per_partner,
  )
  const [timeoutDuration, setTimeoutDuration] = useState(s.timeout_duration)
  const [turnBasedMode, setTurnBasedMode] = useState(s.turn_based_mode)
  const [turnDuration, setTurnDuration] = useState(s.turn_duration)
  const [allowExtensions, setAllowExtensions] = useState(s.allow_extensions)
  const [warmUpQuestions, setWarmUpQuestions] = useState(s.warm_up_questions)
  const [coolDownTime, setCoolDownTime] = useState(s.cool_down_time)

  const [state, action, isPending] = useActionState(sessionAction, {
    error: null,
  })

  if (!hasCoupleId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Session Settings
          </CardTitle>
          <CardDescription>
            Join a couple to configure check-in session settings.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Session Settings
        </CardTitle>
        <CardDescription>
          Configure how check-in sessions work for your couple
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          <input type="hidden" name="sessionDuration" value={sessionDuration} />
          <input
            type="hidden"
            name="timeoutsPerPartner"
            value={timeoutsPerPartner}
          />
          <input type="hidden" name="timeoutDuration" value={timeoutDuration} />
          <input
            type="hidden"
            name="turnBasedMode"
            value={String(turnBasedMode)}
          />
          <input type="hidden" name="turnDuration" value={turnDuration} />
          <input
            type="hidden"
            name="allowExtensions"
            value={String(allowExtensions)}
          />
          <input
            type="hidden"
            name="warmUpQuestions"
            value={String(warmUpQuestions)}
          />
          <input type="hidden" name="coolDownTime" value={coolDownTime} />

          <SliderField
            label="Session Duration"
            value={sessionDuration}
            onChange={setSessionDuration}
            min={5}
            max={120}
            step={5}
            unit="min"
          />

          <SliderField
            label="Timeouts Per Partner"
            value={timeoutsPerPartner}
            onChange={setTimeoutsPerPartner}
            min={0}
            max={5}
            step={1}
          />

          <SliderField
            label="Timeout Duration"
            value={timeoutDuration}
            onChange={setTimeoutDuration}
            min={1}
            max={10}
            step={1}
            unit="min"
          />

          <SwitchField
            label="Turn-Based Mode"
            description="Take turns speaking during check-ins"
            checked={turnBasedMode}
            onChange={setTurnBasedMode}
          />

          {turnBasedMode && (
            <SliderField
              label="Turn Duration"
              value={turnDuration}
              onChange={setTurnDuration}
              min={1}
              max={30}
              step={1}
              unit="min"
            />
          )}

          <SwitchField
            label="Allow Extensions"
            description="Allow extending the session beyond the set duration"
            checked={allowExtensions}
            onChange={setAllowExtensions}
          />

          <SwitchField
            label="Warm-Up Questions"
            description="Start sessions with light warm-up questions"
            checked={warmUpQuestions}
            onChange={setWarmUpQuestions}
          />

          <SliderField
            label="Cool-Down Time"
            value={coolDownTime}
            onChange={setCoolDownTime}
            min={0}
            max={15}
            step={1}
            unit="min"
          />

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Session Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

interface SliderFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  unit?: string
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: SliderFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm font-medium text-muted-foreground">
          {value}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      />
    </div>
  )
}

interface SwitchFieldProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function SwitchField({
  label,
  description,
  checked,
  onChange,
}: SwitchFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
