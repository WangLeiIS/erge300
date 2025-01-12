import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import BottomNav from '@/components/BottomNav'
import { ThemeProvider } from "@/components/ThemeProvider"
import { ThemeToggle } from "@/components/ThemeToggle"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Card Viewer',
  description: 'View cards from books',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen">
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            {children}
            <BottomNav />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}