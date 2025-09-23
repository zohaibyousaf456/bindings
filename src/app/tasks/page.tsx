"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Filter, Grid2X2, List, MoreVertical, Plus, Sparkles } from "lucide-react"

type Status = "TO DO" | "IN PROGRESS" | "ON HOLD" | "COMPLETE"

type Task = {
  id: string
  title: string
  description?: string
  assignedTo: string[]
  associatedWith?: string
  due?: Date | null
  status: Status
}

const USER_POOL = ["Assistant Printer", "Accounts", "Meagan M.", "Alex Johnson", "Jordan Lee"]
const STATUS_POOL: Status[] = ["TO DO", "IN PROGRESS", "ON HOLD", "COMPLETE"]

const SAMPLE_TASKS: Task[] = [
  {
    id: "t-1",
    title: "upload files / more info",
    description: "",
    assignedTo: ["Meagan M.", "Alex Johnson"],
    associatedWith: "Job #6097 | REDed",
    due: new Date("2024-06-18"),
    status: "TO DO",
  },
  {
    id: "t-2",
    title: "Call Edward #4588",
    description: "",
    assignedTo: ["Alex Johnson"],
    associatedWith: undefined,
    due: new Date("2024-07-01"),
    status: "TO DO",
  },
  {
    id: "t-3",
    title: "First",
    description: "Task",
    assignedTo: ["Accounts"],
    associatedWith: undefined,
    due: new Date("2025-09-18"),
    status: "TO DO",
  },
]

function formatDate(d?: Date | null) {
  if (!d) return "-"
  const day = d.getDate().toString().padStart(2, "0")
  const month = d.toLocaleString("en-US", { month: "short" })
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [assignedFilter, setAssignedFilter] = useState<string[]>(["Assistant Printer", "Accounts", "Meagan M."])
  const [statusFilter, setStatusFilter] = useState<Status[]>(["TO DO", "IN PROGRESS", "ON HOLD"]) // from screenshot

  useEffect(() => {
    // preload demo data
    setTasks(SAMPLE_TASKS)
  }, [])

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const a = assignedFilter.length ? t.assignedTo.some((u) => assignedFilter.includes(u)) : true
      const s = statusFilter.length ? statusFilter.includes(t.status) : true
      return a && s
    })
  }, [tasks, assignedFilter, statusFilter])

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Work more collaboratively with your team to organise & prioritise your tasks.
          </p>
          <div className="mt-4 flex items-center gap-6 text-primary">
            <Link href="#" className="inline-flex items-center gap-2 hover:underline">
              <span className="inline-block size-2 rounded bg-primary"></span>
              Get Started
            </Link>
            <button className="inline-flex items-center gap-2 hover:underline">
              <span className="inline-flex size-7 items-center justify-center rounded-full border">
                <span className="i-lucide-play size-3" />
              </span>
              Watch a Video
            </button>
          </div>
        </div>

        <Button className="h-10 px-5 text-sm">
          <Plus className="mr-2 size-4" /> ADD TASK
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <FilterPillGroup label="Assigned To" values={assignedFilter} onClear={() => setAssignedFilter([])} />
        <FilterPillGroup label="Status" values={statusFilter} onClear={() => setStatusFilter([])} />
        {(assignedFilter.length > 0 || statusFilter.length > 0) && (
          <button
            className="text-primary ml-2 text-sm font-medium hover:underline"
            onClick={() => {
              setAssignedFilter([])
              setStatusFilter([])
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[960px]">
              <div className="grid grid-cols-[1.4fr_1fr_1fr_140px_1fr_80px] items-center border-b bg-muted/50 px-6 py-3 text-sm font-medium text-muted-foreground">
                <div>Task</div>
                <div>Assigned To</div>
                <div>Associated With</div>
                <div className="flex items-center gap-1">Due <ChevronDown className="size-4" /></div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>

              {filtered.map((t, idx) => (
                <div
                  key={t.id}
                  className={cn(
                    "grid grid-cols-[1.4fr_1fr_1fr_140px_1fr_80px] items-center px-6 py-4 text-sm",
                    idx % 2 === 1 && "bg-muted/20"
                  )}
                >
                  <div className="min-w-0">
                    <button className="text-primary hover:underline">{t.title}</button>
                    {t.description && (
                      <div className="text-muted-foreground mt-1 text-xs">{t.description}</div>
                    )}
                  </div>
                  <div>
                    <div className="flex -space-x-2">
                      {t.assignedTo.map((n) => (
                        <AvatarCircle key={n} name={n} />
                      ))}
                    </div>
                  </div>
                  <div>
                    {t.associatedWith ? (
                      <button className="text-primary hover:underline">{t.associatedWith}</button>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                  <div className="font-medium text-red-500">{formatDate(t.due)}</div>
                  <div>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" aria-label="actions">
                      <MoreVertical className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer like pagination bar */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <Button variant="outline" size="sm" className="h-8 gap-1 px-3">
                50 <ChevronDown className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span>1-3 of 3</span>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="size-8"><ChevronLeft className="size-4" /></Button>
                <Button variant="ghost" size="icon" className="size-8"><ChevronRight className="size-4" /></Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function FilterPillGroup({
  label,
  values,
  onClear,
}: {
  label: string
  values: readonly (string | Status)[]
  onClear: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-foreground/90 font-medium">{label} ({values.length})</span>
      <div className="flex flex-wrap items-center gap-2">
        {values.map((v) => (
          <span key={String(v)} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
            {String(v)}
            <button className="text-foreground/60" aria-label="remove">×</button>
          </span>
        ))}
      </div>
    </div>
  )
}

function AvatarCircle({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="size-8 rounded-full border bg-primary/10 text-primary flex items-center justify-center text-xs">
      {initials}
    </div>
  )
}

function StatusBadge({ status }: { status: Status }) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide"
  let classes = ""
  switch (status) {
    case "COMPLETE":
      classes = "bg-primary text-white border-primary"
      break
    case "IN PROGRESS":
      classes = "bg-secondary text-secondary-foreground"
      break
    case "ON HOLD":
      classes = "bg-background text-foreground"
      break
    default:
      classes = "bg-background text-foreground"
  }
  return <span className={cn(base, classes)}>{status}</span>
}

