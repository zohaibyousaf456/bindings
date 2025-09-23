"use client"

import * as React from "react"

function Checkbox({ checked, onCheckedChange, ...props }: { checked?: boolean; onCheckedChange?: (checked: boolean) => void } & React.ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      className="size-4 rounded border border-input accent-current"
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  )
}

export { Checkbox }

