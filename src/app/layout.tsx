import type { Metadata } from 'next'

import { Provider } from '@/components/ui/provider'

import './globals.css'

export const metadata: Metadata = {
  description: 'Premium card creation and print-request workflow for lanyard/member cards.',
  title: 'Lanyard Card Design Generator',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ overflow: 'hidden' }}>
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
