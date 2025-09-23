import * as React from "react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl p-6">{children}</div>
    </div>
  )
}

