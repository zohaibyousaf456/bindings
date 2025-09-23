"use client"

import * as React from "react"

type CalendarProps = {
  mode?: "single"
  selected?: Date | undefined
  onSelect?: (date: Date | undefined) => void
  className?: string
}

export function Calendar({ selected, onSelect, className }: CalendarProps) {
  const value = React.useMemo(() => {
    if (!selected) return ""
    const year = selected.getFullYear()
    const month = `${selected.getMonth() + 1}`.padStart(2, "0")
    const day = `${selected.getDate()}`.padStart(2, "0")
    return `${year}-${month}-${day}`
  }, [selected])

  return (
    <input
      type="date"
      className={"w-full rounded-md border bg-transparent px-3 py-2" + (className ? ` ${className}` : "")}
      value={value}
      onChange={(e) => {
        if (!onSelect) return
        if (!e.target.value) onSelect(undefined)
        else onSelect(new Date(e.target.value))
      }}
    />
  )
}

