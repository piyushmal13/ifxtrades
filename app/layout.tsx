import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-provider";
import { Navbar } from "@/components/navbar";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const SITE_URL = "https://www.ifxtrades.com";
const SITE_TITLE = "IFXTrades - Institutional Capital Intelligence";
const SITE_DESCRIPTION =
  "Institutional capital intelligence platform for webinars, algorithm licensing, structured education, and macro research.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | IFXTrades",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "IFXTrades",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/logo.png`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
