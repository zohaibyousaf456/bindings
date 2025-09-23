"use client"

import { useMemo, useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import Badge from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { CalendarIcon, Plus, MoreVertical } from "lucide-react"

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
    title: "First Task",
    description: "Follow up",
    assignedTo: ["Accounts"],
    associatedWith: undefined,
    due: new Date("2025-09-18"),
    status: "TO DO",
  },
]

function formatDate(d?: Date | null) {
  if (!d) return "-"
  const day = d.getDate().toString()
  const month = d.toLocaleString("en-US", { month: "short" })
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS) // start with sample data
  const [open, setOpen] = useState(false)

  // filters (visual only; no real filtering needed for now)
  const [assignedFilter, setAssignedFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<Status[]>([])

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const a = assignedFilter.length ? t.assignedTo.some((u) => assignedFilter.includes(u)) : true
      const s = statusFilter.length ? statusFilter.includes(t.status) : true
      return a && s
    })
  }, [tasks, assignedFilter, statusFilter])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">
              Work more collaboratively with your team to organise & prioritise your tasks.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full lg:w-auto bg-green-500 hover:bg-green-600 text-white">
                ADD TASK
              </Button>
            </DialogTrigger>
            <AddTaskDialog
              onCancel={() => setOpen(false)}
              onSave={(task) => {
                setTasks((prev) => [task, ...prev])
                setOpen(false)
              }}
            />
          </Dialog>
        </div>

        {/* Filter Pills Section */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Get Started and Watch Video pills */}
          <div className="flex gap-2">
            <Badge variant="default" className="bg-cyan-400 text-white px-4 py-2 rounded-full hover:bg-cyan-500">
              📋 Get Started
            </Badge>
            <Badge variant="default" className="bg-cyan-400 text-white px-4 py-2 rounded-full hover:bg-cyan-500">
              ▶️ Watch a Video
            </Badge>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Assigned To (3)</span>
              <button className="text-gray-400">▼</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Status (3)</span>
              <button className="text-gray-400">▼</button>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="default" className="bg-cyan-400 text-white px-3 py-1 rounded-full text-sm hover:bg-cyan-500 cursor-pointer">
                Assistant Printer ×
              </Badge>
              <Badge variant="default" className="bg-cyan-400 text-white px-3 py-1 rounded-full text-sm hover:bg-cyan-500 cursor-pointer">
                Accounts ×
              </Badge>
              <Badge variant="default" className="bg-cyan-400 text-white px-3 py-1 rounded-full text-sm hover:bg-cyan-500 cursor-pointer">
                Meagan M. ×
              </Badge>
              <Badge variant="default" className="bg-cyan-400 text-white px-3 py-1 rounded-full text-sm hover:bg-cyan-500 cursor-pointer">
                TO DO ×
              </Badge>
              <Badge variant="default" className="bg-cyan-400 text-white px-3 py-1 rounded-full text-sm hover:bg-cyan-500 cursor-pointer">
                IN PROGRESS ×
              </Badge>
              <Badge variant="default" className="bg-cyan-400 text-white px-3 py-1 rounded-full text-sm hover:bg-cyan-500 cursor-pointer">
                ON HOLD ×
              </Badge>
            </div>
            
            <button className="text-cyan-400 hover:underline text-sm font-medium">Clear All</button>
          </div>
          
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              ⚡
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              |||
            </Button>
            <Button variant="default" className="bg-cyan-400 text-white hover:bg-cyan-500 h-8 w-8 p-0">
              ☰
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b">
                    <TableHead className="font-medium text-gray-700 py-4">Task</TableHead>
                    <TableHead className="font-medium text-gray-700">Assigned To</TableHead>
                    <TableHead className="font-medium text-gray-700">Associated with</TableHead>
                    <TableHead className="font-medium text-gray-700">Due</TableHead>
                    <TableHead className="font-medium text-gray-700">Status</TableHead>
                    <TableHead className="font-medium text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id} className="hover:bg-gray-50 border-b border-gray-100">
                      <TableCell className="py-4">
                        <button className="text-cyan-500 underline-offset-2 hover:underline font-medium">
                          {t.title}
                        </button>
                        {t.description && <div className="text-xs text-gray-500 mt-1">{t.description}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {t.assignedTo.map((name, index) => (
                            <AvatarCircle key={name} name={name} index={index} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {t.associatedWith ? (
                          <button className="text-cyan-500 underline-offset-2 hover:underline">
                            {t.associatedWith}
                          </button>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-red-400 font-medium">{formatDate(t.due ?? undefined)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="uppercase tracking-wide text-xs px-2 py-1 bg-gray-100 text-gray-700 border-gray-300"
                        >
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4 text-gray-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
              <div className="text-sm text-gray-600">
                Rows per page: <span className="font-medium">50 ▼</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">1-3 of 3</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" disabled className="h-8 w-8 p-0">
                    ‹
                  </Button>
                  <Button variant="ghost" size="sm" disabled className="h-8 w-8 p-0">
                    ›
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function AvatarCircle({ name, index }: { name: string; index: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
    
  // Different colors for different people to match the image
  const colors = [
    "bg-orange-200 text-orange-800", // First person (orange-ish)
    "bg-pink-200 text-pink-800",    // Second person (pink-ish)
    "bg-cyan-200 text-cyan-800",    // Third person (cyan-ish)
  ]
  
  const colorClass = colors[index % colors.length] || "bg-gray-200 text-gray-800"
  
  return (
    <div className={`h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium ${colorClass}`}>
      {initials}
    </div>
  )
}

function PillsSlider<T extends string>({
  items,
  value,
  onChange,
}: {
  items: readonly T[]
  value?: T
  onChange: (val: T) => void
}) {
  return (
    <ScrollArea className="[&>div>div[style]]:block!">
      <div className="flex gap-2 overflow-x-auto py-1">
        {items.map((item) => {
          const selected = item === value
          return (
            <button
              key={item}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border",
                selected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted/60",
              )}
              onClick={() => onChange(item)}
              type="button"
            >
              {item}
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}

function MultiPillsSlider<T extends string>({
  items,
  value,
  onToggle,
}: {
  items: readonly T[]
  value: readonly T[]
  onToggle: (val: T) => void
}) {
  return (
    <ScrollArea className="[&>div>div[style]]:block!">
      <div className="flex gap-2 overflow-x-auto py-1">
        {items.map((item) => {
          const selected = value.includes(item)
          return (
            <button
              key={item}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border",
                selected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted/60",
              )}
              onClick={() => onToggle(item)}
              type="button"
            >
              {item}
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}

function AddTaskDialog({
  onSave,
  onCancel,
}: {
  onSave: (task: Task) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<Status>("TO DO")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [allDay, setAllDay] = useState(true)
  const [resource, setResource] = useState("")
  const [customer, setCustomer] = useState("")
  const [assignTo, setAssignTo] = useState<string[]>([])

  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Add Task</DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Follow up with client" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <PillsSlider items={STATUS_POOL} value={status} onChange={setStatus} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start w-full bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? formatDate(date) : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2">
                <Checkbox id="allday" checked={allDay} onCheckedChange={(v) => setAllDay(Boolean(v))} />
                <label htmlFor="allday" className="text-sm">
                  All Day
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Resource</label>
            <Input value={resource} onChange={(e) => setResource(e.target.value)} placeholder="Optional" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Assign To</label>
            <MultiPillsSlider
              items={USER_POOL}
              value={assignTo}
              onToggle={(name) =>
                setAssignTo((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Customer</label>
            <Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Optional" />
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            const newTask: Task = {
              id: crypto.randomUUID(),
              title: title || "Untitled Task",
              description,
              assignedTo: assignTo.length ? assignTo : ["Meagan M."],
              associatedWith: customer || undefined,
              due: date ?? null,
              status,
            }
            onSave(newTask)
          }}
        >
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}