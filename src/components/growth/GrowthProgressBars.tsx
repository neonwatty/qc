import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GrowthProgressBarsProps {
  scores: Array<{ area: string; label: string; score: number; color: string }>
  className?: string
}

export function GrowthProgressBars({ scores, className }: GrowthProgressBarsProps): React.ReactElement {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Growth Areas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {scores.map((item) => (
            <div key={item.area}>
              <div className="mb-1.5 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <p className="text-xs text-muted-foreground">{item.area}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{item.score}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${item.score}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
