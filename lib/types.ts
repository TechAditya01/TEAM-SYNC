export type AlertCategory =
  | "road_block"
  | "water_disruption"
  | "power_outage"
  | "traffic_jam"
  | "public_event"
  | "safety_concern"
  | "infrastructure"
  | "other"

export type SeverityLevel = "low" | "medium" | "high" | "critical"

export type VerificationStatus = "pending" | "verified" | "rejected" | "resolved"

export type UserRole = "citizen" | "admin" | "moderator"

export interface Alert {
  id: string
  user_id?: string
  category: AlertCategory
  title: string
  description: string
  location_lat: number
  location_lng: number
  location_address?: string
  severity: SeverityLevel
  status: VerificationStatus
  image_url?: string
  upvotes: number
  downvotes: number
  verified_by?: string
  verified_at?: string
  resolved_at?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  full_name?: string
  phone_number?: string
  role: UserRole
  verified: boolean
  created_at: string
  updated_at: string
}

export const CATEGORY_LABELS: Record<AlertCategory, string> = {
  road_block: "Road Block",
  water_disruption: "Water Disruption",
  power_outage: "Power Outage",
  traffic_jam: "Traffic Jam",
  public_event: "Public Event",
  safety_concern: "Safety Concern",
  infrastructure: "Infrastructure",
  other: "Other",
}

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
}

export const CATEGORY_ICONS: Record<AlertCategory, string> = {
  road_block: "🚧",
  water_disruption: "💧",
  power_outage: "⚡",
  traffic_jam: "🚗",
  public_event: "📢",
  safety_concern: "⚠️",
  infrastructure: "🏗️",
  other: "📍",
}
