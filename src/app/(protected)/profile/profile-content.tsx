'use client'

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

export function ProfileContent() {
  const { signOut } = useAuth()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
              <p className="text-lg font-medium">Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                Profile management is currently under development.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
                <p className="text-lg font-medium">Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  Security settings are currently under development.
                </p>
              </div>
              <div className="border-t pt-6">
                <h3 className="text-base font-medium mb-4">Session Management</h3>
                <Button 
                  variant="destructive" 
                  className="w-full sm:w-auto hover:bg-destructive/90"
                  onClick={() => signOut?.()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">User Preferences</h2>
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
              <p className="text-lg font-medium">Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                Preference settings are currently under development.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 