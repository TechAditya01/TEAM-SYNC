import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function ConfirmPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Email Confirmed</CardTitle>
          <CardDescription>Your account has been successfully verified</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/auth/login" className="block">
            <Button className="w-full">Continue to Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
