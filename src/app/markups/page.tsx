'use client'

import React from "react"
import Sidebar from "@/components/Sidebar"

export default function MarkupsPage() {
  const [openMenuFor, setOpenMenuFor] = React.useState<string | null>(null)

  const markupItems: string[] = [
    "APPAREL PRICING",
    "A/S DTG PRICING",
    "A/S SCREEN PRINTING",
    "TOPS - STANDARD DIGITAL PRINTING",
    "TOPS - EXPRESS DIGITAL PRINTING",
    "TOPS - SAME DAY DIGITAL PRINTING",
  ]

  React.useEffect(() => {
    const onClick = () => setOpenMenuFor(null)
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenuFor(null)
    }
    document.addEventListener("click", onClick)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("click", onClick)
      document.removeEventListener("keydown", onEsc)
    }
  }, [])

  const handleToggleMenu = (name: string) => (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenMenuFor((prev) => (prev === name ? null : name))
  }

  const handleEdit = (name: string) => {
    setOpenMenuFor(null)
    console.log("Edit", name)
  }

  const handleDelete = (name: string) => {
    setOpenMenuFor(null)
    console.log("Delete", name)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] bg-gray-50">
      <aside className="hidden lg:block border-r border-gray-200 bg-white">
        <Sidebar />
      </aside>

      <main className="p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Markups</h1>
            <p className="text-gray-600">Completely automate your quoting processes with automated markups.</p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sky-600 bg-sky-50 border border-sky-200 rounded-md px-3 py-2 mt-3 hover:bg-sky-100"
              aria-label="Get Started"
            >
              <BookmarkIcon />
              <span className="font-medium">Get Started</span>
            </a>
          </div>
          <button
            type="button"
            className="h-10 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow"
          >
            ADD MARKUP
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Saved Markups</h2>
            <span className="inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-full text-sm font-semibold text-sky-700 bg-sky-100 border border-sky-200">
              {markupItems.length}
            </span>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-semibold tracking-wider text-gray-500 uppercase px-4 py-3 border-b border-gray-200 w-[75%]">
                  Markup Name
                </th>
                <th className="text-right text-xs font-semibold tracking-wider text-gray-500 uppercase px-4 py-3 border-b border-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {markupItems.map((name) => {
                const isOpen = openMenuFor === name
                return (
                  <tr key={name} className="group hover:bg-gray-50/80">
                    <td className="px-4 py-4 border-b border-gray-100 align-middle">
                      <span className="text-base font-medium text-gray-900">{name}</span>
                    </td>
                    <td className="px-4 py-4 border-b border-gray-100 align-middle text-right">
                      <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          aria-label={`Open actions for ${name}`}
                          aria-haspopup="menu"
                          aria-expanded={isOpen}
                          onClick={handleToggleMenu(name)}
                          className={`inline-flex items-center justify-center w-9 h-9 rounded-md border transition-colors ${
                            isOpen
                              ? "bg-gray-100 border-gray-300"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <EllipsisVerticalIcon />
                        </button>

                        {isOpen && (
                          <div
                            role="menu"
                            aria-label={`Actions for ${name}`}
                            tabIndex={-1}
                            className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg p-1 z-20"
                          >
                            <button
                              role="menuitem"
                              onClick={() => handleEdit(name)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                              <PencilIcon />
                              <span>Edit</span>
                            </button>
                            <button
                              role="menuitem"
                              onClick={() => handleDelete(name)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
                            >
                              <TrashIcon />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

function BookmarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#0ea5e9" aria-hidden="true">
      <path d="M6 2h12a2 2 0 0 1 2 2v18l-8-4-8 4V4a2 2 0 0 1 2-2z" />
    </svg>
  )
}

function EllipsisVerticalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#6b7280" aria-hidden="true">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#374151" aria-hidden="true">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
      <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42L18.37 3.3a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.84z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" aria-hidden="true">
      <path d="M6 7h12v2H6V7zm2 3h8l-1 10H9L8 10zm3-6h2l1 2H10l1-2z" />
    </svg>
  )
}

