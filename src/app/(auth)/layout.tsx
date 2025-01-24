import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Logo } from "@/components/ui/logo"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {/* Simple header with just logo and theme toggle */}
      <header className="absolute top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Logo size="sm" />
            <span className="font-bold">TonIQ</span>
          </Link>
          <ModeToggle />
        </div>
      </header>
      
      {/* Center the auth forms */}
      <main className="container flex min-h-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {children}
        </div>
      </main>
    </div>
  )
} 