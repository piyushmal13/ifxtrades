import { Suspense } from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SignupClient } from "./SignupClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata({
  title: "Open Your Account",
  description:
    "Create your IFXTrades institutional account. Access webinars, algorithm licensing, macro research, and university programs.",
  path: "/signup",
});

export default function SignupPage() {
  return (
    <Suspense>
      <SignupClient />
    </Suspense>
  );
}
