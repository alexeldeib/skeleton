import './globals.css'
import type { Metadata } from 'next'
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

export const metadata: Metadata = {
  title: 'SaaS Product - Modern Solution for Your Needs',
  description: 'Powerful SaaS platform to help you achieve your goals with our feature-rich SaaS solution',
  keywords: ['SaaS', 'Software', 'Cloud', 'Business', 'Analytics', 'Dashboard'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className={`${inter.className} antialiased bg-white dark:bg-secondary text-secondary dark:text-white`}>
        {children}
      </body>
    </html>
  )
}