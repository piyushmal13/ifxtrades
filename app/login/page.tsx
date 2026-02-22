import { Suspense } from "react"
import LoginClient from "./LoginClient"
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic"
export const metadata = buildMetadata({
  title: "Login",
  description: "Secure account access for dashboard, licenses, and institutional resources.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-20 text-jpm-muted">Loading...</div>}>
      <LoginClient />
    </Suspense>
  )
}
