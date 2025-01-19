import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import BottomNav from '@/components/BottomNav'
import { ThemeProvider } from "@/components/ThemeProvider"
import TopNav from '@/components/TopNav'
import { AuthProvider } from '@/contexts/auth-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '悠卡阅读',
  description: '悠卡阅读 read.yoga',
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
        <AuthProvider>
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
        </AuthProvider>
      </body>
    </html>
  )
}