import './globals.css'
import { AuthProvider } from '@/lib/auth-provider'
import Header from '@/components/Header'

export const metadata = {
  title: "IFXTrades — Institutional Capital Intelligence",
  description: "Global trading ecosystem structured around disciplined execution."
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-[#0F172A] antialiased">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
