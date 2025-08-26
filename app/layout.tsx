import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AuthSessionProvider } from "@/components/providers/session-provider"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "TransferApp - Secure Money Transfers to Madagascar",
  description: "Send money securely to Madagascar with automated recurring transfers",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
