"use client"

import type { Alert } from "@/lib/types"
import { CATEGORY_LABELS } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, AlertCircle, CheckCircle2, XCircle, Activity } from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { startOfDay, subDays, format, eachDayOfInterval } from "date-fns"

interface AnalyticsDashboardProps {
  alerts: Alert[]
  adminActions: any[]
}

export function AnalyticsDashboard({ alerts, adminActions }: AnalyticsDashboardProps) {
  // Calculate statistics
  const totalAlerts = alerts.length
  const verifiedAlerts = alerts.filter((a) => a.status === "verified").length
  const pendingAlerts = alerts.filter((a) => a.status === "pending").length
  const rejectedAlerts = alerts.filter((a) => a.status === "rejected").length
  const resolvedAlerts = alerts.filter((a) => a.status === "resolved").length

  // Category distribution
  const categoryData = Object.keys(CATEGORY_LABELS).map((category) => ({
    name: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS],
    value: alerts.filter((a) => a.category === category).length,
  }))

  // Severity distribution
  const severityData = [
    { name: "Low", value: alerts.filter((a) => a.severity === "low").length },
    { name: "Medium", value: alerts.filter((a) => a.severity === "medium").length },
    { name: "High", value: alerts.filter((a) => a.severity === "high").length },
    { name: "Critical", value: alerts.filter((a) => a.severity === "critical").length },
  ]

  // Alerts over time (last 30 days)
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date(),
  })

  const alertsOverTime = last30Days.map((day) => {
    const dayStart = startOfDay(day)
    const dayAlerts = alerts.filter((alert) => {
      const alertDay = startOfDay(new Date(alert.created_at))
      return alertDay.getTime() === dayStart.getTime()
    })

    return {
      date: format(day, "MMM dd"),
      total: dayAlerts.length,
      verified: dayAlerts.filter((a) => a.status === "verified").length,
      pending: dayAlerts.filter((a) => a.status === "pending").length,
    }
  })

  // Chart colors
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]

  // Verification rate
  const verificationRate = totalAlerts > 0 ? ((verifiedAlerts / totalAlerts) * 100).toFixed(1) : 0

  // Average response time (mock for now)
  const avgResponseTime = "2.4h"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              <p className="text-sm text-muted-foreground">Platform insights and statistics</p>
            </div>
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAlerts}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{verifiedAlerts}</div>
              <p className="text-xs text-muted-foreground">{verificationRate}% of total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingAlerts}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedAlerts}</div>
              <p className="text-xs text-muted-foreground">Not approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{resolvedAlerts}</div>
              <p className="text-xs text-muted-foreground">Issues fixed</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Alerts Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts Trend (Last 30 Days)</CardTitle>
              <CardDescription>Daily alert submissions and verifications</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={alertsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total" />
                  <Line type="monotone" dataKey="verified" stroke="#10b981" name="Verified" />
                  <Line type="monotone" dataKey="pending" stroke="#f59e0b" name="Pending" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Categories</CardTitle>
              <CardDescription>Distribution by category type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Severity and Admin Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Severity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Severity Levels</CardTitle>
              <CardDescription>Alert severity breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={severityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Admin Activity</CardTitle>
              <CardDescription>Latest moderation actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {adminActions.slice(0, 10).map((action) => (
                  <div key={action.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="text-sm font-medium capitalize">{action.action_type}</p>
                      {action.notes && <p className="text-xs text-muted-foreground">{action.notes}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(action.created_at), "MMM dd, HH:mm")}
                    </span>
                  </div>
                ))}
                {adminActions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No admin actions yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
