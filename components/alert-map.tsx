"use client"

import { useEffect, useRef, useState } from "react"
import type { Alert } from "@/lib/types"
import { MapPin, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface AlertMapProps {
  alerts: Alert[]
  onMarkerClick?: (alert: Alert) => void
  center?: { lat: number; lng: number }
  isRefreshing?: boolean
}

export function AlertMap({ alerts, onMarkerClick, center, isRefreshing }: AlertMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isClient, setIsClient] = useState(false)

  const defaultCenter = center || { lat: 28.6139, lng: 77.209 }

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView([defaultCenter.lat, defaultCenter.lng], 12)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    leafletMapRef.current = map

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!isClient || !leafletMapRef.current) return

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default
      const map = leafletMapRef.current

      // Clear existing markers
      markersRef.current.forEach(marker => map.removeLayer(marker))
      markersRef.current = []

      // Add new markers
      alerts.forEach((alert) => {
        const markerColor = getMarkerColor(alert.severity)
        const customIcon = L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        const marker = L.marker([alert.location_lat, alert.location_lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${alert.title}</h3>
              <p class="text-xs text-gray-600 mb-2">${alert.location_address}</p>
              <div class="flex gap-1 mb-2">
                <span class="px-2 py-1 bg-gray-100 text-xs rounded">${alert.category}</span>
                <span class="px-2 py-1 bg-${getSeverityColor(alert.severity)}-100 text-xs rounded">${alert.severity}</span>
              </div>
              <p class="text-xs">${alert.description}</p>
            </div>
          `)

        if (onMarkerClick) {
          marker.on("click", () => onMarkerClick(alert))
        }

        markersRef.current.push(marker)
      })

      // Fit bounds if there are alerts
      if (alerts.length > 0) {
        const group = new L.featureGroup(markersRef.current)
        map.fitBounds(group.getBounds().pad(0.1))
      } else {
        map.setView([defaultCenter.lat, defaultCenter.lng], 12)
      }
    }

    updateMarkers()
  }, [isClient, alerts, onMarkerClick, defaultCenter.lat, defaultCenter.lng])

  function getMarkerColor(severity: string): string {
    const colorMap: Record<string, string> = {
      low: "#3b82f6", // blue
      medium: "#eab308", // yellow
      high: "#f97316", // orange
      critical: "#ef4444", // red
    }
    return colorMap[severity] || "#6b7280" // gray
  }

  function getSeverityColor(severity: string): string {
    const colorMap: Record<string, string> = {
      low: "blue",
      medium: "yellow",
      high: "orange",
      critical: "red",
    }
    return colorMap[severity] || "gray"
  }

  if (!isClient) {
    return (
      <div className="relative h-full w-full flex flex-col">
        <div className="flex-1 relative rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Refresh Indicator */}
      {isRefreshing && (
        <div className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
        </div>
      )}

      <div className="flex-1 relative rounded-lg border overflow-hidden bg-muted">
        <div ref={mapRef} className="h-full w-full" />
        {alerts.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No alerts to display</p>
            </div>
          </div>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">Alert Locations ({alerts.length})</span>
          </div>
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className="p-3 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onMarkerClick?.(alert)}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-3 h-3 rounded-full mt-1"
                  style={{ backgroundColor: getMarkerColor(alert.severity) }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{alert.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{alert.location_address}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {alert.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
