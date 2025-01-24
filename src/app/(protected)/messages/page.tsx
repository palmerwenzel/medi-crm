import { Card } from "@/components/ui/card"

export const metadata = {
  title: 'Messages - TonIQ',
  description: 'Communicate with your healthcare team.',
}

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with your healthcare team securely.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
          <p className="text-lg font-medium">Coming Soon</p>
          <p className="text-sm text-muted-foreground">
            The messaging system is currently under development.
          </p>
        </div>
      </Card>
    </div>
  )
} 