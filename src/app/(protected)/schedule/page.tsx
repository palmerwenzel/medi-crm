import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"

export const metadata = {
  title: 'Schedule - MediCRM',
  description: 'View and manage your appointments.',
}

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground">
          View and manage your appointments.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Calendar</h2>
          <Calendar
            mode="single"
            selected={new Date()}
            className="rounded-md border"
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
            <p className="text-lg font-medium">Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              The appointment system is currently under development.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
} 