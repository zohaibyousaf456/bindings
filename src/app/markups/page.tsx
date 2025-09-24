"use client"

import React, { useState } from "react"
import Sidebar from "@/components/Sidebar"

export default function MarkupPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const markupItems: string[] = [
    "APPAREL PRICING",
    "A/S DTG PRICING",
    "A/S SCREEN PRINTING",
    "TOPS - STANDARD DIGITAL PRINTING",
    "TOPS - EXPRESS DIGITAL PRINTING",
    "TOPS - SAME DAY DIGITAL PRINTING",
  ]

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-white">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white/70 px-4 py-3 backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <HamburgerIcon />
          Menu
        </button>
        <span className="text-sm font-semibold text-slate-700">Quoter Pro</span>
      </div>

      <div className="mx-auto flex w-full max-w-7xl md:px-4">
        {/* Sidebar */}
        <div className="md:sticky md:top-0 md:h-[100svh] md:shrink-0">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <main className="flex-1 px-4 py-6 md:p-8">
          {/* Heading */}
          <div className="mb-6 grid grid-cols-1 items-start gap-4 md:mb-8 md:grid-cols-[1fr_auto]">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <BookmarkIcon />
                Get Started
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Markups</h1>
              <p className="max-w-2xl text-sm text-slate-600">
                Completely automate your quoting processes with smart, rule‑based markups.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                type="button"
                onClick={() => setIsSidebarOpen(true)}
              >
                ADD MARKUP
              </button>
            </div>
          </div>

          {/* Card / Table */}
          <section className="overflow-hidden rounded-2xl border border-border bg-white/80 shadow-xl backdrop-blur">
            <div className="border-b border-border bg-gradient-to-b from-white to-slate-50/40 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-wide text-slate-700">Markup List</h2>
                <span className="text-xs text-slate-500">{markupItems.length} total</span>
              </div>
            </div>

            <div className="relative">
              <table className="w-full table-fixed border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="sticky top-0 z-10 h-12 bg-white/90 px-6 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 backdrop-blur">
                      Markup Name
                    </th>
                    <th className="sticky top-0 z-10 h-12 bg-white/90 px-6 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 backdrop-blur">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {markupItems.map((name) => (
                    <tr key={name} className="group">
                      <td className="border-t border-border px-6 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 place-items-center rounded-md bg-emerald-100 text-emerald-700">
                            <TagIcon />
                          </div>
                          <span className="text-sm font-medium text-slate-800">{name}</span>
                        </div>
                      </td>
                      <td className="border-t border-border px-6 py-4 align-middle">
                        <div className="flex items-center justify-end">
                          <button
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                            type="button"
                            aria-label={`Open actions for ${name}`}
                            onClick={() => {}}
                          >
                            <EllipsisVerticalIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function BookmarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-600" aria-hidden>
      <path d="M6 2h12a2 2 0 0 1 2 2v18l-8-4-8 4V4a2 2 0 0 1 2-2z" />
    </svg>
  )
}

function EllipsisVerticalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-slate-500" aria-hidden>
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20.59 13.41 12 4.83A2 2 0 0 0 10.59 4H4v6.59A2 2 0 0 0 4.59 12l8.58 8.59a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.83ZM7 7h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

