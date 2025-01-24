import { Card } from "@/components/ui/card"
import { BarChart, LineChart, PieChart, Activity } from "lucide-react"

export const metadata = {
  title: 'Analytics - TonIQ',
  description: 'System analytics and statistics.',
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          System analytics and statistics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-2 glass-sm rounded-full">
              <BarChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Case Statistics</h3>
            <p className="text-sm text-muted-foreground">Coming Soon</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-2 glass-sm rounded-full">
              <LineChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Usage Trends</h3>
            <p className="text-sm text-muted-foreground">Coming Soon</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-2 glass-sm rounded-full">
              <PieChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">User Distribution</h3>
            <p className="text-sm text-muted-foreground">Coming Soon</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-2 glass-sm rounded-full">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">System Health</h3>
            <p className="text-sm text-muted-foreground">Coming Soon</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Detailed Analytics</h2>
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
          <p className="text-lg font-medium">Coming Soon</p>
          <p className="text-sm text-muted-foreground">
            Detailed analytics features are currently under development.
          </p>
        </div>
      </Card>
    </div>
  )
} 