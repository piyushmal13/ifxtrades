import { Suspense } from "react";
import LoginClient from "@/app/login/LoginClient";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildMetadata({
  title: "Signup",
  description: "Create an IFXTrades account to access webinars, algorithm licensing, and university programs.",
  path: "/signup",
});

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-20">Loading...</div>}>
      <LoginClient initialView="signup" />
    </Suspense>
  );
}
