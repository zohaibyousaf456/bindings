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
  const day = d.getDate().toString().padStart(2, "0")
  const month = d.toLocaleString("en-US", { month: "short" })
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [open, setOpen] = useState(false)

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">
              Work more collaboratively with your team to organise & prioritise your tasks.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full lg:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <AddTaskDialog
              onCancel={() => setOpen(false)}
              onSave={(task) => {
                setTasks((prev) => (prev.length === 0 ? [task, ...SAMPLE_TASKS] : [task, ...prev]))
                setOpen(false)
              }}
            />
          </Dialog>
        </div>

        <div className="flex flex-wrap gap-2 items-center text-sm">
          <span className="text-foreground/80 font-medium">Assigned To</span>
          {assignedFilter.map((name) => (
            <Badge key={name} variant="secondary" className="px-3">
              {name}
              <button
                className="ml-2 text-muted-foreground/70 hover:text-foreground"
                onClick={() => setAssignedFilter((f) => f.filter((x) => x !== name))}
                aria-label={`Remove ${name}`}
              >
                ×
              </button>
            </Badge>
          ))}
          <span className="mx-1">•</span>
          <span className="text-foreground/80 font-medium">Status</span>
          {statusFilter.map((st) => (
            <Badge key={st} variant="secondary" className="px-3">
              {st}
              <button
                className="ml-2 text-muted-foreground/70 hover:text-foreground"
                onClick={() => setStatusFilter((f) => f.filter((x) => x !== st))}
                aria-label={`Remove ${st}`}
              >
                ×
              </button>
            </Badge>
          ))}
          {(assignedFilter.length > 0 || statusFilter.length > 0) && (
            <>
              <span className="mx-1">•</span>
              <button
                className="text-primary hover:underline"
                onClick={() => {
                  setAssignedFilter([])
                  setStatusFilter([])
                }}
              >
                Clear All
              </button>
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Tasks</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <EmptyTableState />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Task</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Associated With</TableHead>
                      <TableHead className="whitespace-nowrap">Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t) => (
                      <TableRow key={t.id} className="hover:bg-muted/40">
                        <TableCell className="min-w-[220px]">
                          <button className="text-primary underline-offset-2 hover:underline">{t.title}</button>
                          {t.description && <div className="text-xs text-muted-foreground mt-1">{t.description}</div>}
                        </TableCell>
                        <TableCell className="min-w-[160px]">
                          <div className="flex -space-x-2">
                            {t.assignedTo.map((name) => (
                              <AvatarCircle key={name} name={name} />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[180px]">
                          {t.associatedWith ? (
                            <button className="text-primary underline-offset-2 hover:underline">
                              {t.associatedWith}
                            </button>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-red-500 font-medium">{formatDate(t.due ?? undefined)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              t.status === "COMPLETE"
                                ? "default"
                                : t.status === "IN PROGRESS"
                                  ? "secondary"
                                  : t.status === "ON HOLD"
                                    ? "outline"
                                    : "outline"
                            }
                            className="uppercase tracking-wide"
                          >
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function EmptyTableState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-24 w-32 rounded-lg bg-muted flex items-center justify-center mb-6">
        <div className="h-12 w-16 rounded bg-primary/10" />
      </div>
      <p className="text-lg font-semibold">No Results</p>
      <p className="text-sm text-muted-foreground mt-1">Try changing or clearing your filters.</p>
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
    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-border flex items-center justify-center text-xs">
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

