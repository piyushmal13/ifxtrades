import "./globals.css"
import { AuthProvider } from "@/lib/auth-provider"
import { Navbar } from "@/components/navbar"

export const metadata = {
  title: "IFXTrades",
  description: "Institutional Capital Intelligence",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>

        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>

      </body>
    </html>
  )
}
