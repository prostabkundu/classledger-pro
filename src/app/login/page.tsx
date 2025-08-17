'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster, toast } from "sonner"

export default function LoginPage() {
  const r = useRouter()
  const [email, setEmail] = useState("owner@example.com")
  const [password, setPassword] = useState("CHANGE_ME")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
    setLoading(false)
    if (res.ok) { toast.success("Logged in"); r.push("/") }
    else { toast.error("Invalid credentials") }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-50 p-6">
      <Toaster richColors position="top-right" />
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle>Login</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div><Label>Email</Label><Input value={email} onChange={e=>setEmail(e.target.value)} type="email" required /></div>
            <div><Label>Password</Label><Input value={password} onChange={e=>setPassword(e.target.value)} type="password" required /></div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Signing in..." : "Sign in"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
