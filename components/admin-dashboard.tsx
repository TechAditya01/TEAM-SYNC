"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Alert, Profile } from "@/lib/types"
import { AdminAlertCard } from "@/components/admin-alert-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AdminDashboardProps {
  initialAlerts: Alert[]
  profile: Profile
}

export function AdminDashboard({ initialAlerts, profile }: AdminDashboardProps) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("admin-alerts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alerts",
        },
        () => {
          fetchAlerts()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchAlerts() {
    const supabase = createClient()
    const { data } = await supabase.from("alerts").select("*").order("created_at", { ascending: false }).limit(100)

    if (data) {
      setAlerts(data)
    }
  }

  const filterAlerts = (status: string) => {
    let filtered = alerts.filter((alert) => alert.status === status)

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (alert) =>
          alert.title.toLowerCase().includes(query) ||
          alert.description.toLowerCase().includes(query) ||
          alert.location_address?.toLowerCase().includes(query),
      )
    }

    return filtered
  }

  const pendingAlerts = filterAlerts("pending")
  const verifiedAlerts = filterAlerts("verified")
  const rejectedAlerts = filterAlerts("rejected")
  const resolvedAlerts = filterAlerts("resolved")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Verify and manage community alerts</p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-3xl">{alerts.filter((a) => a.status === "pending").length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Verified</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {alerts.filter((a) => a.status === "verified").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Rejected</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {alerts.filter((a) => a.status === "rejected").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Resolved</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {alerts.filter((a) => a.status === "resolved").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingAlerts.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {pendingAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="space-y-4">
              {pendingAlerts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No pending alerts to review
                  </CardContent>
                </Card>
              ) : (
                pendingAlerts.map((alert) => (
                  <AdminAlertCard key={alert.id} alert={alert} onUpdate={fetchAlerts} adminId={profile.id} />
                ))
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
                verifiedAlerts.map((alert) => (
                  <AdminAlertCard key={alert.id} alert={alert} onUpdate={fetchAlerts} adminId={profile.id} />
                ))
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
                rejectedAlerts.map((alert) => (
                  <AdminAlertCard key={alert.id} alert={alert} onUpdate={fetchAlerts} adminId={profile.id} />
                ))
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
                resolvedAlerts.map((alert) => (
                  <AdminAlertCard key={alert.id} alert={alert} onUpdate={fetchAlerts} adminId={profile.id} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
