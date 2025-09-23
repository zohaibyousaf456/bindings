"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type DialogContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function Dialog({
  open: openProp,
  onOpenChange,
  children,
  className,
}: React.PropsWithChildren<{
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = typeof openProp === "boolean"
  const open = isControlled ? (openProp as boolean) : uncontrolledOpen

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (isControlled) onOpenChange?.(next)
      else setUncontrolledOpen(next)
    },
    [isControlled, onOpenChange]
  )

  const value = React.useMemo(() => ({ open, setOpen }), [open, setOpen])

  return (
    <DialogContext.Provider value={value}>
      <div className={cn(className)}>{children}</div>
    </DialogContext.Provider>
  )
}

function useDialogContext() {
  const ctx = React.useContext(DialogContext)
  if (!ctx) throw new Error("Dialog components must be used within <Dialog>")
  return ctx
}

function DialogTrigger({ asChild, children, ...props }: { asChild?: boolean } & React.ComponentProps<"button">) {
  const { setOpen } = useDialogContext()
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e)
        setOpen(true)
      },
    })
  }
  return (
    <button {...props} onClick={() => setOpen(true)}>
      {children}
    </button>
  )
}

function DialogContent({ className, children }: React.ComponentProps<"div">) {
  const { open, setOpen } = useDialogContext()
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={() => setOpen(false)} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-lg rounded-xl border bg-background p-6 shadow-lg",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-4", className)} {...props} />
}

function DialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-6 flex items-center justify-end gap-2", className)} {...props} />
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter }

