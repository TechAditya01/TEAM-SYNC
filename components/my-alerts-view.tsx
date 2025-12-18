"use client"

import type { Alert } from "@/lib/types"
import { AlertCard } from "@/components/alert-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

interface MyAlertsViewProps {
  alerts: Alert[]
}

export function MyAlertsView({ alerts }: MyAlertsViewProps) {
  const pendingAlerts = alerts.filter((a) => a.status === "pending")
  const verifiedAlerts = alerts.filter((a) => a.status === "verified")
  const rejectedAlerts = alerts.filter((a) => a.status === "rejected")
  const resolvedAlerts = alerts.filter((a) => a.status === "resolved")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">My Alerts</h1>
              <p className="text-sm text-muted-foreground">View and manage your submitted alerts</p>
            </div>
            <div className="flex gap-2">
              <Link href="/submit">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Alert
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingAlerts.length})</TabsTrigger>
            <TabsTrigger value="verified">Verified ({verifiedAlerts.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedAlerts.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolvedAlerts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">You haven't submitted any alerts yet</p>
                    <Link href="/submit">
                      <Button>Submit Your First Alert</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                alerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <div className="space-y-4">
              {pendingAlerts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">No pending alerts</CardContent>
                </Card>
              ) : (
                pendingAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="verified" className="mt-6">
            <div className="space-y-4">
              {verifiedAlerts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">No verified alerts</CardContent>
                </Card>
              ) : (
                verifiedAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <div className="space-y-4">
              {rejectedAlerts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">No rejected alerts</CardContent>
                </Card>
              ) : (
                rejectedAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="resolved" className="mt-6">
            <div className="space-y-4">
              {resolvedAlerts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">No resolved alerts</CardContent>
                </Card>
              ) : (
                resolvedAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
