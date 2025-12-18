"use client"

import { type Alert, CATEGORY_ICONS, SEVERITY_COLORS } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown, MapPin, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface AlertCardProps {
  alert: Alert
  onClick?: () => void
}

export function AlertCard({ alert, onClick }: AlertCardProps) {
  const severityColors = {
    low: "bg-blue-500 hover:bg-blue-600",
    medium: "bg-yellow-500 hover:bg-yellow-600",
    high: "bg-orange-500 hover:bg-orange-600",
    critical: "bg-red-500 hover:bg-red-600",
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      case "high":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Card
      className={cn(
        "cursor-pointer group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-l-4 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
        alert.severity === "critical" && "border-l-red-500",
        alert.severity === "high" && "border-l-orange-500",
        alert.severity === "medium" && "border-l-yellow-500",
        alert.severity === "low" && "border-l-blue-500"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      aria-label={`Alert: ${alert.title}. Severity: ${alert.severity}. Status: ${alert.status}. ${alert.upvotes} upvotes, ${alert.downvotes} downvotes.`}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
            {CATEGORY_ICONS[alert.category]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-bold text-lg text-balance group-hover:text-primary transition-colors">
                {alert.title}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                {getSeverityIcon(alert.severity)}
                <Badge
                  className={cn(
                    "text-white font-semibold px-3 py-1 text-xs uppercase tracking-wide",
                    severityColors[alert.severity]
                  )}
                >
                  {alert.severity}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
              {alert.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
              <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1">{alert.location_address || "Location not specified"}</span>
              </div>

              <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-700">{alert.upvotes}</span>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <span className="text-red-700">{alert.downvotes}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {alert.status === "verified" && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {alert.status === "pending" && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
