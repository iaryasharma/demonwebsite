"use client"

export function LoggingToggle({
    checked,
    onChange,
    accent = "brand",
    disabled = false,
    "aria-label": ariaLabel,
}: {
    checked: boolean
    onChange: (next: boolean) => void
    accent?: "brand" | "green"
    disabled?: boolean
    "aria-label"?: string
}) {
    const onCls = accent === "green" ? "bg-green-500" : "bg-[#8b5cf6]"

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex shrink-0 disabled:cursor-not-allowed disabled:opacity-50`}
        >
            <span className={`block h-6 w-10 rounded-full transition-colors ${checked ? onCls : "bg-zinc-700"}`} />
            <span
                className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    checked ? "translate-x-4" : ""
                }`}
            />
        </button>
    )
}
