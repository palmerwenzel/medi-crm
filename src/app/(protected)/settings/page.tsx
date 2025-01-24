import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Settings2, Users, Bell, Shield, Database } from "lucide-react"

export const metadata = {
  title: 'Settings - TonIQ',
  description: 'System settings and configuration.',
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          System settings and configuration.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Settings2 className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">General Settings</h2>
              </div>
              <Button variant="outline">Save Changes</Button>
            </div>
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
              <p className="text-lg font-medium">Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                General settings configuration is under development.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">User Management</h2>
              </div>
              <Button variant="outline">Add User</Button>
            </div>
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
              <p className="text-lg font-medium">Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                User management features are under development.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Notification Settings</h2>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
              <p className="text-lg font-medium">Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                Notification configuration is under development.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Security Settings</h2>
              </div>
              <Button variant="outline">Update</Button>
            </div>
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
              <p className="text-lg font-medium">Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                Security configuration is under development.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">System Configuration</h2>
              </div>
              <Button variant="outline">Manage</Button>
            </div>
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
              <p className="text-lg font-medium">Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                System configuration features are under development.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 