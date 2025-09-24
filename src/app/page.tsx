"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, MoreHorizontal, Plus, Search } from "lucide-react"
import { ChatToggle } from "@/components/chat-toggle"

type Vendor = {
  id: number
  name: string
  email: string
}

function getInitials(name: string) {
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "?"
}

function colorFromString(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `linear-gradient(135deg,hsl(${hue} 80% 80%),hsl(${(hue + 40) % 360} 75% 70%))`
}

export default function HomePage() {
  const defaultAgentId = "80db399f-28fa-4b53-8f0f-df5b18278402"

  const [query, setQuery] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "email">("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const [vendors] = useState<Vendor[]>([
    { id: 1, name: "ARTS SPOT", email: "production@artsspot.com.au" },
    { id: 2, name: "AS Colour (AU)", email: "accounts@ascolour.com.au" },
    { id: 3, name: "Aussie Pacific (AU)", email: "accounts@tabookai.com.au" },
    { id: 4, name: "BOTTEGA MADE", email: "info@bottegamade.com.au" },
    { id: 5, name: "BY CONTAIN", email: "support@haloprintco.com" },
    { id: 6, name: "COLOUR PLANE", email: "colour@colourplane.com" },
    { id: 7, name: "CUSTOMER SUPPLIED GARMENTS", email: "design@haloprintco.com" },
  ])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const next = q
      ? vendors.filter(
          (v) =>
            v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q)
        )
      : vendors

    return [...next].sort((a, b) => {
      const aVal = a[sortBy].toLowerCase()
      const bVal = b[sortBy].toLowerCase()
      const cmp = aVal.localeCompare(bVal)
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [vendors, query, sortBy, sortDir])

  function toggleSort(column: "name" | "email") {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(column)
      setSortDir("asc")
    }
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-white to-secondary/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage your supplier contacts and details
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="size-4" />
            Add Vendor
          </Button>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-secondary/70 backdrop-blur supports-[backdrop-filter]:bg-secondary/60">
                <tr>
                  <th className="w-[55%] px-4 py-3 text-left font-medium text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => toggleSort("name")}
                      className="inline-flex items-center gap-2 hover:text-foreground"
                    >
                      Name
                      <ArrowUpDown className="size-4" />
                    </button>
                  </th>
                  <th className="w-[35%] px-4 py-3 text-left font-medium text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => toggleSort("email")}
                      className="inline-flex items-center gap-2 hover:text-foreground"
                    >
                      Email
                      <ArrowUpDown className="size-4" />
                    </button>
                  </th>
                  <th className="w-[10%] px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="border-t hover:bg-accent/40"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="grid size-9 place-items-center rounded-full text-[13px] font-semibold text-foreground/80 shadow-sm"
                          style={{ backgroundImage: colorFromString(vendor.name) }}
                        >
                          {getInitials(vendor.name)}
                        </span>
                        <span className="line-clamp-1 font-medium">{vendor.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-muted-foreground">{vendor.email}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="ghost" size="icon" aria-label="Row actions">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ChatToggle agentId={defaultAgentId} />
    </main>
  )
}
