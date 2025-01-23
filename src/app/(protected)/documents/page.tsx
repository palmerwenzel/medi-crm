import { Card } from "@/components/ui/card"
import { FileText, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: 'Documents - MediCRM',
  description: 'Access and manage your medical documents.',
}

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Access and manage your medical documents.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Documents</h2>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              View All
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
            <p className="text-lg font-medium">Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              Document management is currently under development.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Upload Documents</h2>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
            <p className="text-lg font-medium">Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              Document upload functionality is currently under development.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
} 