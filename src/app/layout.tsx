import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { Providers } from "@/components/providers"
import { Analytics } from "@vercel/analytics/react"
import { ConnectKitButton } from "connectkit"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Settle",
  description: "USDC based Universal Merchant Payment Gateway",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="default-dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
     
        <Providers>

          {children}
        </Providers>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}