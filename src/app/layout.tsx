import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'

import { Provider } from '@/components/ui/provider'

import './globals.css'

const cardSans = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-card-sans',
  weight: ['500', '600', '700'],
})

export const metadata: Metadata = {
  description: 'Premium card creation and print-request workflow for lanyard/member cards.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  title: 'Lanyard Card Design Generator',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cardSans.variable} style={{ overflow: 'hidden' }}>
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
