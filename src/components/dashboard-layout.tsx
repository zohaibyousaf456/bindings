"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Building2, CreditCard, Home, PlugZap, Users } from "lucide-react"

type DashboardLayoutProps = {
  title?: string
  description?: string
  children: React.ReactNode
}

type NavItem = {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/pages/overview", icon: Home },
  { label: "Organization", href: "/pages/organization", icon: Building2 },
  { label: "Team", href: "/pages/team", icon: Users },
  { label: "Billing", href: "/pages/billing", icon: CreditCard },
  { label: "Integrations", href: "/pages/integrations", icon: PlugZap },
]

export default function DashboardLayout({ title, description, children }: DashboardLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="mx-auto grid w-full max-w-7xl gap-0 px-4 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="hidden border-border/60 lg:sticky lg:top-0 lg:mb-0 lg:block lg:h-screen lg:border-r">
          <ScrollArea className="h-screen py-6 pr-2">
            <div className="flex flex-col gap-2">
              <div className="px-3 py-2">
                <div className="text-lg font-semibold">Settings</div>
                <div className="text-muted-foreground text-sm">Manage your account and workspace</div>
              </div>
              <nav className="flex flex-col gap-1 px-2">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {Icon ? <Icon className="size-4" /> : null}
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </ScrollArea>
        </aside>

        <main className="flex min-h-screen flex-1 flex-col py-6 lg:py-8">
          <div className="flex flex-col gap-1">
            {title ? <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1> : null}
            {description ? (
              <p className="text-muted-foreground text-sm sm:text-base">{description}</p>
            ) : null}
          </div>
          <div className="mt-6 flex-1">{children}</div>
        </main>
      </div>
    </div>
  )
}

