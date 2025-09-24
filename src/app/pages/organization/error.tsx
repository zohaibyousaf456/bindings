"use client"

export default function Error({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <div className="font-medium text-destructive">Something went wrong</div>
      <div className="text-muted-foreground">{error.message}</div>
    </div>
  )
}

