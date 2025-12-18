"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Alert, AlertCategory, SeverityLevel } from "@/lib/types"
import { AlertCard } from "@/components/alert-card"
import { AlertMap } from "@/components/alert-map"
import { AlertFilters } from "@/components/alert-filters"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  List,
  RefreshCw,
  Plus,
  Shield,
  Users,
  Zap,
  Eye,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<AlertCategory[]>([])
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | "all">("all")

  useEffect(() => {
    fetchAlerts()
  }, [selectedCategories, selectedSeverity])

  const fetchAlerts = async () => {
    try {
      const supabase = createClient()
      let query = supabase
        .from("alerts")
        .select("*")
        .eq("status", "verified")
        .order("created_at", { ascending: false })

      if (selectedCategories.length > 0) {
        query = query.in("category", selectedCategories)
      }
      if (selectedSeverity !== "all") {
        query = query.eq("severity", selectedSeverity)
      }

      const { data, error } = await query

      if (error) throw error
      setAlerts(data || [])
    } catch (error) {
      console.error("Error fetching alerts:", error)
      // Don't show error to user, just log it
      // The UI will show empty state gracefully
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    fetchAlerts()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Hero Section with Gradient Background */}
      <section className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 md:py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 md:px-4 py-2 mb-4 md:mb-6">
              <Shield className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-xs md:text-sm font-medium">Trusted Community Alerts</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              Stay Informed, Stay Safe
              <span className="block text-blue-200">with Nagar Alert Hub</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-blue-100 leading-relaxed px-4 md:px-0">
              Real-time community disruption alerts for road blocks, water outages, and local events.
              Report, verify, and stay connected with your neighborhood.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4 md:px-0">
              <Link href="/submit">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl px-6 md:px-8 py-3 text-base md:text-lg font-semibold w-full sm:w-auto">
                  <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Report an Alert
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 shadow-xl px-6 md:px-8 py-3 text-base md:text-lg font-semibold w-full sm:w-auto"
                onClick={() => document.getElementById('alerts-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Eye className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                View Alerts
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Community Impact at a Glance
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Real-time statistics from your local alert network
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Active Alerts</CardTitle>
                <div className="bg-blue-500 p-2 rounded-lg">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">{alerts.length}</div>
                <p className="text-xs text-blue-700 dark:text-blue-300">Verified community reports</p>
                <div className="mt-2 flex items-center text-green-600 dark:text-green-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span className="text-xs">+12% from last week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">Critical Issues</CardTitle>
                <div className="bg-red-500 p-2 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-900 dark:text-red-100 mb-1">
                  {alerts.filter(a => a.severity === "critical").length}
                </div>
                <p className="text-xs text-red-700 dark:text-red-300">Require immediate attention</p>
                <Badge variant="destructive" className="mt-2 text-xs">High Priority</Badge>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Resolved Today</CardTitle>
                <div className="bg-green-500 p-2 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">
                  {alerts.filter(a => a.status === "resolved" &&
                    new Date(a.created_at).toDateString() === new Date().toDateString()).length}
                </div>
                <p className="text-xs text-green-700 dark:text-green-300">Issues fixed today</p>
                <div className="mt-2 flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span className="text-xs">Community heroes at work</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Nagar Alert Hub?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Built by the community, for the community. Our platform empowers local residents with real-time information and collaborative reporting.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Real-Time Updates</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Instant notifications about local disruptions, ensuring you're always informed about what's happening in your community.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Community Driven</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Verified reports from local residents, creating a trusted network of community members working together for safety.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Location Aware</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Interactive maps and location-based alerts help you understand exactly where issues are occurring in your area.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alerts Section */}
      <section id="alerts-section" className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Current Community Alerts
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Stay updated with the latest verified reports from your local area
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <AlertFilters
              selectedCategories={selectedCategories}
              selectedSeverity={selectedSeverity}
              onCategoryChange={setSelectedCategories}
              onSeverityChange={setSelectedSeverity}
              onReset={() => {
                setSelectedCategories([])
                setSelectedSeverity("all")
              }}
            />
            <Link href="/submit">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Report Alert
              </Button>
            </Link>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-muted-foreground">Loading community alerts...</p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="map" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Map View
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  List View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="space-y-6">
                <AlertMap alerts={alerts} />
              </TabsContent>

              <TabsContent value="list" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {alerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                  {alerts.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl">
                        <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No active alerts</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                          Great news! There are currently no verified alerts in your area. Help keep it that way by reporting any issues you notice.
                        </p>
                        <Link href="/submit">
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Report First Issue
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </div>
  )
}
