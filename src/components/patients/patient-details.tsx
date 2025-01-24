'use client'

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, MessageSquare, Calendar, Clock } from "lucide-react"
import type { Database } from "@/types/supabase"

type Patient = Database['public']['Tables']['users']['Row']
type Case = Database['public']['Tables']['cases']['Row']

interface PatientWithCases extends Patient {
  cases: Case[]
  full_name: string
  phone?: string
  date_of_birth?: string
  medical_history?: string
  status?: 'active' | 'inactive'
}

interface PatientDetailsProps {
  patient: PatientWithCases
}

/**
 * Patient details component with role-based access control
 * Shows different views and actions based on user role:
 * - Patients: View own details and cases
 * - Staff: View and update patient details, manage cases
 * - Admin: Full access to patient data and management
 */
export function PatientDetails({ patient }: PatientDetailsProps) {
  const { userRole } = useAuth()
  const [activeTab, setActiveTab] = React.useState("overview")

  const canEdit = userRole === "staff" || userRole === "admin"
  const activeCases = patient.cases?.filter(c => c.status === "open" || c.status === "in_progress") || []
  
  return (
    <div className="space-y-6">
      {/* Patient Overview Card */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{patient.full_name}</CardTitle>
              <CardDescription>Patient ID: {patient.id}</CardDescription>
            </div>
            {canEdit && (
              <Button variant="outline">
                Edit Details
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{patient.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p>{patient.phone || "Not provided"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
              <p>{patient.date_of_birth || "Not provided"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p>{patient.status || "Active"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Different Sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="cases" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Cases ({activeCases.length})
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
              <CardDescription>Patient&apos;s medical background and notes</CardDescription>
            </CardHeader>
            <CardContent>
              {patient.medical_history ? (
                <div className="prose dark:prose-invert">
                  {patient.medical_history}
                </div>
              ) : (
                <p className="text-muted-foreground">No medical history recorded.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Cases</CardTitle>
              <CardDescription>Current medical cases and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {activeCases.length > 0 ? (
                <div className="space-y-4">
                  {activeCases.map((case_) => (
                    <div key={case_.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{case_.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Opened: {new Date(case_.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost">View Details</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No active cases.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No upcoming appointments.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No recent messages.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
