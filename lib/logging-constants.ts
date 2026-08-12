/** Categories that own a routing mode (emoji/soundboard inherit expressions). */
export const ROUTABLE_CATEGORIES = [
    "moderation",
    "modCommands",
    "messages",
    "members",
    "server",
    "expressions",
    "voice",
    "verification",
    "autorole",
    "tickets",
    "security",
] as const

export type RoutableCategory = (typeof ROUTABLE_CATEGORIES)[number]
export type CategoryRoutingMode = "category" | "granular"

/**
 * Map legacy global `mode` → per-category modes (matches demon-v5 Logging model).
 * - granular → every category granular
 * - multi / single → every category "category"
 */
export function buildMigratedCategoryModes(
    legacyMode: string | null | undefined,
): Record<RoutableCategory, CategoryRoutingMode> {
    const mode: CategoryRoutingMode = legacyMode === "granular" ? "granular" : "category"
    const modes = {} as Record<RoutableCategory, CategoryRoutingMode>
    for (const key of ROUTABLE_CATEGORIES) modes[key] = mode
    return modes
}
