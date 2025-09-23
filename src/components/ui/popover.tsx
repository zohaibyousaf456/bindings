"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type PopoverContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

function Popover({ children }: React.PropsWithChildren) {
  const [open, setOpen] = React.useState(false)
  const value = React.useMemo(() => ({ open, setOpen }), [open])
  return <PopoverContext.Provider value={value}><div className="relative inline-block">{children}</div></PopoverContext.Provider>
}

function usePopoverContext() {
  const ctx = React.useContext(PopoverContext)
  if (!ctx) throw new Error("Popover components must be used within <Popover>")
  return ctx
}

function PopoverTrigger({ asChild, children, ...props }: { asChild?: boolean } & React.ComponentProps<"button">) {
  const { setOpen } = usePopoverContext()
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e)
        setOpen(true)
      },
    })
  }
  return <button {...props} onClick={() => setOpen(true)}>{children}</button>
}

function PopoverContent({ className, align, children }: React.ComponentProps<"div"> & { align?: "start" | "center" | "end" }) {
  const { open, setOpen } = usePopoverContext()
  if (!open) return null
  const alignClass = align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0"
  return (
    <div className={cn("absolute z-50 mt-2 min-w-[200px] rounded-md border bg-background p-3 shadow-md", alignClass, className)}>
      <div className="absolute -top-2 right-2">
        <button className="text-xs text-muted-foreground" onClick={() => setOpen(false)} aria-label="Close">✕</button>
      </div>
      {children}
    </div>
  )
}

export { Popover, PopoverContent, PopoverTrigger }

