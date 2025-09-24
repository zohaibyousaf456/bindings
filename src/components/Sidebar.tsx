"use client"

import React from "react"
import { cn } from "@/lib/utils"

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        aria-hidden={!isOpen}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      {/* Drawer (mobile) + Static (md+) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-white/95 shadow-xl transition-transform duration-300 md:static md:z-auto md:translate-x-0 md:bg-white/60 md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
              <LogoIcon />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-slate-800">Quoter Pro</span>
              <span className="text-xs text-slate-500">Operations Suite</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            <SidebarItem label="Dashboard" active={false} />
            <SidebarItem label="Markups" active />
            <SidebarItem label="Orders" active={false} />
            <SidebarItem label="Customers" active={false} />
            <SidebarItem label="Reports" active={false} />
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-emerald-600 hover:to-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              onClick={onClose}
            >
              Close Menu
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function SidebarItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
        active
          ? "bg-emerald-50/80 text-emerald-700 ring-1 ring-emerald-200"
          : "text-slate-600 hover:bg-slate-50"
      )}
      aria-current={active ? "page" : undefined}
    >
      <span className="font-medium">{label}</span>
      <span
        className={cn(
          "grid h-6 w-6 place-items-center rounded-md border border-border text-slate-400 transition group-hover:border-slate-300 group-hover:text-slate-600",
          active && "border-emerald-200 text-emerald-600"
        )}
        aria-hidden
      >
        <ChevronRightIcon />
      </span>
    </button>
  )
}

function LogoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <path d="M4 12a8 8 0 1 1 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 4v8l5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

