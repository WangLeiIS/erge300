import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import BottomNav from '@/components/BottomNav'
import { ThemeProvider } from "@/components/ThemeProvider"
import { ThemeToggle } from "@/components/ThemeToggle"
import TopNav from '@/components/TopNav'

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
          <TopNav />
          <div className="pt-[60px] pb-[72px] min-h-screen">
            {children}
          </div>
          <BottomNav />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}