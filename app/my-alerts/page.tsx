import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MyAlertsView } from "@/components/my-alerts-view"

export default async function MyAlertsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <MyAlertsView alerts={alerts || []} />
}
