"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function OrganizationSettingsPage() {
  const [isSaving, setIsSaving] = React.useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setIsSaving(true)
    window.setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log("Saved organization settings", Object.fromEntries(formData.entries()))
      setIsSaving(false)
    }, 900)
  }

  return (
    <DashboardLayout
      title="Organization"
      description="Manage your organization's profile, domains and preferences."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader className="border-b">
              <CardTitle>Organization Profile</CardTitle>
              <CardDescription>Basic details used across your workspace.</CardDescription>
              <CardAction>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-4 py-6">
              <div className="grid gap-1.5">
                <label htmlFor="org-name" className="text-sm font-medium">
                  Organization name
                </label>
                <Input id="org-name" name="name" placeholder="Acme Inc" required />
                <p className="text-muted-foreground text-xs">
                  This is displayed on invoices, invites and emails.
                </p>
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="org-slug" className="text-sm font-medium">
                  Workspace slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">app.example.com/</span>
                  <Input id="org-slug" name="slug" placeholder="acme" className="max-w-48" />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="org-email" className="text-sm font-medium">
                  Billing email
                </label>
                <Input id="org-email" name="billingEmail" type="email" placeholder="finance@acme.com" />
              </div>
            </CardContent>
            <CardFooter className="border-t justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Domains</CardTitle>
            <CardDescription>Connect custom domains used for authentication links.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 py-6">
            <DomainRow label="Primary domain" placeholder="acme.com" name="primaryDomain" />
            <DomainRow label="Support domain" placeholder="help.acme.com" name="supportDomain" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle>Security</CardTitle>
            <CardDescription>Organization-wide authentication and access policies.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 py-6">
            <div className="grid gap-1.5">
              <label htmlFor="sso-domain" className="text-sm font-medium">
                SSO domain
              </label>
              <Input id="sso-domain" name="ssoDomain" placeholder="sso.acme.com" />
              <p className="text-muted-foreground text-xs">If set, users must sign in via your identity provider.</p>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="allowed-email-domain" className="text-sm font-medium">
                Allowed email domain
              </label>
              <Input id="allowed-email-domain" name="allowedEmailDomain" placeholder="acme.com" />
              <p className="text-muted-foreground text-xs">Only users with this domain can join without invite.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function DomainRow({ label, placeholder, name }: { label: string; placeholder: string; name: string }) {
  const [value, setValue] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium" htmlFor={name}>
          {label}
        </label>
        <div className="flex items-center gap-2">
          <Input
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
            className="w-[260px]"
          />
          <Button
            type="button"
            onClick={() => {
              setSaving(true)
              window.setTimeout(() => setSaving(false), 700)
            }}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground text-xs">
        We will verify DNS and apply the domain to outbound emails.
      </p>
    </div>
  )
}

