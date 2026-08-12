"use client"

import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-20 text-center sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="relative mb-8">
            <Image
              src="/demon-logo.png"
              alt="Demon Bot"
              width={120}
              height={120}
              className="mx-auto opacity-50 grayscale"
              draggable={false}
            />
          </div>

          <h1 className="mb-4 bg-gradient-to-r from-white via-[#8b5cf6] to-white bg-clip-text text-8xl font-bold text-transparent md:text-9xl">
            404
          </h1>

          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Page Not Found</h2>

          <p className="mx-auto mb-8 max-w-2xl text-xl text-slate-300">
            Oops! It looks like this page wandered off into the digital void. Even our demon bot couldn&apos;t find it!
          </p>
        </div>

        <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900/70 p-8">
          <h3 className="mb-4 text-xl font-semibold text-white">What happened?</h3>
          <ul className="space-y-2 text-left text-slate-300">
            <li className="flex items-center">
              <span className="mr-3 h-2 w-2 rounded-full bg-[#8b5cf6]" />
              The page you&apos;re looking for might have been moved or deleted
            </li>
            <li className="flex items-center">
              <span className="mr-3 h-2 w-2 rounded-full bg-[#8b5cf6]" />
              You might have typed the URL incorrectly
            </li>
            <li className="flex items-center">
              <span className="mr-3 h-2 w-2 rounded-full bg-[#8b5cf6]" />
              The link you followed might be broken or outdated
            </li>
          </ul>
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/">
            <Button
              size="lg"
              className="rounded-xl bg-[#8b5cf6] px-8 py-6 text-lg font-medium text-white shadow-lg shadow-[#8b5cf6]/25 transition-transform hover:scale-[1.02] hover:bg-[#7c3aed]"
            >
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>

          <Button
            size="lg"
            variant="outline"
            onClick={() => window.history.back()}
            className="rounded-xl border-slate-600 bg-slate-800/50 px-8 py-6 text-lg font-medium transition-transform hover:scale-[1.02] hover:border-[#8b5cf6] hover:text-[#8b5cf6]"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>

        <div className="mt-12 text-slate-400">
          <p className="text-sm">
            Need help? Join our{" "}
            <a
              href="https://discord.com/invite"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8b5cf6] underline transition-colors hover:text-[#8b5cf6]/80"
            >
              Discord Server
            </a>{" "}
            for support
          </p>
        </div>
      </div>
    </div>
  )
}
