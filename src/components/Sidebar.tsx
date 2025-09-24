import React from "react"

export default function Sidebar() {
  const navItems: Array<{ label: string; href: string; icon: React.ReactNode }> = [
    { label: "Dashboard", href: "#", icon: <HomeIcon /> },
    { label: "Markups", href: "#", icon: <TagIcon /> },
    { label: "Orders", href: "#", icon: <InboxIcon /> },
    { label: "Products", href: "#", icon: <CubeIcon /> },
    { label: "Reports", href: "#", icon: <ChartIcon /> },
    { label: "Settings", href: "#", icon: <GearIcon /> },
  ]

  return (
    <div className="md:h-screen md:sticky md:top-0 flex flex-col bg-white/90 supports-[backdrop-filter]:bg-white/70 backdrop-blur border-r border-gray-200">
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-md" />
          <div>
            <div className="text-sm uppercase tracking-widest text-gray-500">Console</div>
            <div className="font-bold text-gray-800">Your App</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="group flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-400 group-hover:text-gray-600">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-3 border-t border-gray-200">
        <a
          href="#"
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <PlusIcon />
          New Item
        </a>
      </div>
    </div>
  )
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5z" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M10.5 3H6a2 2 0 0 0-2 2v4.5a2 2 0 0 0 .586 1.414l7.5 7.5a2 2 0 0 0 2.828 0l4.5-4.5a2 2 0 0 0 0-2.828l-7.5-7.5A2 2 0 0 0 10.5 3z" />
      <circle cx="8.5" cy="8.5" r="1.25" />
    </svg>
  )
}

function InboxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M21 14v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4l3-9h12l3 9z" />
      <path d="M3 14h5a4 4 0 0 0 8 0h5" />
    </svg>
  )
}

function CubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M12 13v9" />
      <path d="M3 8v8l9 5 9-5V8" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M3 3v18h18" />
      <rect x="7" y="10" width="3" height="7" />
      <rect x="12" y="6" width="3" height="11" />
      <rect x="17" y="13" width="3" height="4" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09c.68 0 1.29-.39 1.58-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.5.5 1.23.65 1.82.33.61-.29 1-.9 1-1.58V2a2 2 0 1 1 4 0v.09c0 .68.39 1.29 1 1.58.59.32 1.32.17 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.5.5-.65 1.23-.33 1.82.29.61.9 1 1.58 1H22a2 2 0 1 1 0 4h-.09c-.68 0-1.29.39-1.58 1z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-gray-600">
      <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
    </svg>
  )
}

