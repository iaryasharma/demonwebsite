import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const SUPPORT_SERVER_URL = "https://discord.gg/5MredjDjed"

export function PolicyLayout({
  title,
  subtitle,
  updated,
  children,
}: {
  title: string
  subtitle: string
  updated: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text">{title}</h1>
          <p className="text-xl text-gray-400">{subtitle}</p>
          <p className="text-sm text-gray-500 mt-3">Last updated: {updated}</p>
        </div>
        <div className="space-y-8">{children}</div>
      </div>
    </div>
  )
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-[#8b5cf6]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-gray-300 space-y-3 leading-relaxed">{children}</CardContent>
    </Card>
  )
}

export function PolicyList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden="true">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** Simple two/three-column table that scrolls on small screens. */
export function PolicyTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-white/10 text-gray-400">
            {head.map((h) => (
              <th key={h} className="py-2 pr-4 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/5 align-top">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SupportLink() {
  return (
    <a href={SUPPORT_SERVER_URL} className="text-[#8b5cf6] hover:underline" target="_blank" rel="noopener noreferrer">
      Demon support server
    </a>
  )
}
