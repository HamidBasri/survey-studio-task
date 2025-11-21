import { ThemeProvider, type Theme } from '@/lib/providers/theme-provider'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { cookies } from 'next/headers'
import { use } from 'react'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

async function getInitialTheme(): Promise<Theme> {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value

  if (theme === 'light' || theme === 'dark') {
    return theme
  }

  return 'light'
}

export const metadata: Metadata = {
  title: 'Survey Studio',
  description: 'Dynamic survey builder to design, manage and analyse custom surveys.',
  icons: {
    icon: [
      { url: '/images/favicon/favicon.ico', sizes: 'any' },
      { url: '/images/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/images/favicon/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/images/favicon/apple-touch-icon.png',
  },
  manifest: '/images/favicon/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialTheme = use(getInitialTheme())

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = document.cookie.match(/theme=([^;]+)/)?.[1] || 'light';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>
      </body>
    </html>
  )
}
