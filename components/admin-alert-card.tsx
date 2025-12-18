"use client"

import type { Alert } from "@/lib/types"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CATEGORY_LABELS, CATEGORY_ICONS, SEVERITY_COLORS } from "@/lib/types"
import { CheckCircle, XCircle, Trash2, MapPin, Clock, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"

interface AdminAlertCardProps {
  alert: Alert
  onUpdate: () => void
  adminId: string
}

export function AdminAlertCard({ alert, onUpdate, adminId }: AdminAlertCardProps) {
  const [loading, setLoading] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState("")

  async function updateAlertStatus(status: "verified" | "rejected" | "resolved") {
    setLoading(true)
    const supabase = createClient()

    try {
      const updateData: any = {
        status,
      }

      if (status === "verified" && alert.status === "pending") {
        updateData.verified_by = adminId
        updateData.verified_at = new Date().toISOString()
      }

      if (status === "resolved") {
        updateData.resolved_at = new Date().toISOString()
      }

      const { error } = await supabase.from("alerts").update(updateData).eq("id", alert.id)

      if (error) throw error

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: adminId,
        action_type: status,
        alert_id: alert.id,
        notes: notes || null,
      })

      setNotes("")
      setShowNotes(false)
      onUpdate()
    } catch (error) {
      console.error("[v0] Error updating alert:", error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteAlert() {
    if (!confirm("Are you sure you want to delete this alert? This action cannot be undone.")) {
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("alerts").delete().eq("id", alert.id)

      if (error) throw error

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: adminId,
        action_type: "deleted",
        alert_id: alert.id,
      })

      onUpdate()
    } catch (error) {
      console.error("[v0] Error deleting alert:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="text-3xl">{CATEGORY_ICONS[alert.category]}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-lg text-balance">{alert.title}</h3>
                <div className="flex gap-2 shrink-0">
                  <Badge className={`${SEVERITY_COLORS[alert.severity]} text-white`}>{alert.severity}</Badge>
                  <Badge variant="outline">{CATEGORY_LABELS[alert.category]}</Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{alert.description}</p>

              {alert.image_url && (
                <div className="mb-4">
                  <Image
                    src={alert.image_url || "/placeholder.svg"}
                    alt="Alert image"
                    width={400}
                    height={300}
                    className="rounded-lg border w-full max-w-md h-48 object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{alert.location_address || "Location"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</span>
                </div>

                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{alert.upvotes}</span>
                </div>

                <div className="flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <span className="font-medium">{alert.downvotes}</span>
                </div>
              </div>
            </div>
          </div>

          {showNotes && (
            <div className="space-y-2">
              <Textarea
                placeholder="Add notes about this action (optional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-muted/50 flex flex-wrap gap-2">
        {alert.status === "pending" && (
          <>
            <Button
              size="sm"
              variant="default"
              onClick={() => updateAlertStatus("verified")}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verify
            </Button>
            <Button size="sm" variant="destructive" onClick={() => updateAlertStatus("rejected")} disabled={loading}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </>
        )}

        {alert.status === "verified" && (
          <Button
            size="sm"
            variant="default"
            onClick={() => updateAlertStatus("resolved")}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark Resolved
          </Button>
        )}

        <Button size="sm" variant="outline" onClick={() => setShowNotes(!showNotes)}>
          <MessageSquare className="h-4 w-4 mr-2" />
          {showNotes ? "Hide" : "Add"} Notes
        </Button>

        <Button size="sm" variant="ghost" onClick={deleteAlert} disabled={loading} className="text-destructive ml-auto">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
