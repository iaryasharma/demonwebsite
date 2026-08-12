import {
    ROUTABLE_CATEGORIES,
    buildMigratedCategoryModes,
    type CategoryRoutingMode,
    type RoutableCategory,
} from "@/lib/logging-constants"

export type { CategoryRoutingMode, RoutableCategory }

export type ChannelKey = RoutableCategory | "emoji" | "soundboard"

export type EventKey =
    | "memberJoin"
    | "memberLeave"
    | "ban"
    | "unban"
    | "kick"
    | "messageDelete"
    | "messageEdit"
    | "modCommand"
    | "verification"
    | "autorole"
    | "roleCreate"
    | "roleDelete"
    | "roleUpdate"
    | "channelCreate"
    | "channelDelete"
    | "channelUpdate"
    | "emojiCreate"
    | "emojiUpdate"
    | "emojiDelete"
    | "soundboardCreate"
    | "soundboardUpdate"
    | "soundboardDelete"
    | "serverUpdate"
    | "nicknameUpdate"
    | "memberRoleAdd"
    | "memberRoleRemove"
    | "memberTimeout"
    | "memberUntimeout"
    | "voiceJoin"
    | "voiceLeave"
    | "voiceMove"
    | "voiceKick"
    | "voiceMute"
    | "voiceDeafen"
    | "ticketCreate"
    | "ticketClose"
    | "ticketReopen"
    | "ticketClaim"
    | "ticketUnclaim"
    | "ticketPriority"
    | "ticketUserAdd"
    | "ticketUserRemove"
    | "ticketTransfer"
    | "securityViolation"

export interface LoggingConfig {
    enabled: boolean
    mode?: "single" | "multi" | "granular"
    categoryModes: Record<RoutableCategory, CategoryRoutingMode>
    categoryRoutingMigrated: boolean
    fallbackOnly: boolean
    channelId: string | null
    channels: Record<ChannelKey, string | null>
    eventChannels: Record<EventKey, string | null>
    events: Record<EventKey, boolean>
}

export const EVENT_LABELS: Record<EventKey, string> = {
    memberJoin: "Member Join",
    memberLeave: "Member Leave",
    ban: "Ban",
    unban: "Unban",
    kick: "Kick",
    messageDelete: "Message Delete",
    messageEdit: "Message Edit",
    modCommand: "Mod Command",
    verification: "Verification",
    autorole: "Auto-Role",
    roleCreate: "Role Create",
    roleDelete: "Role Delete",
    roleUpdate: "Role Update",
    channelCreate: "Channel Create",
    channelDelete: "Channel Delete",
    channelUpdate: "Channel Update",
    emojiCreate: "Emoji Create",
    emojiUpdate: "Emoji Update",
    emojiDelete: "Emoji Delete",
    soundboardCreate: "Soundboard Create",
    soundboardUpdate: "Soundboard Update",
    soundboardDelete: "Soundboard Delete",
    serverUpdate: "Server Update",
    nicknameUpdate: "Nickname Update",
    memberRoleAdd: "Member Role Add",
    memberRoleRemove: "Member Role Remove",
    memberTimeout: "Member Timeout",
    memberUntimeout: "Member Untimeout",
    voiceJoin: "Voice Join",
    voiceLeave: "Voice Leave",
    voiceMove: "Voice Move",
    voiceKick: "Voice Kick",
    voiceMute: "Voice Mute",
    voiceDeafen: "Voice Deafen",
    ticketCreate: "Ticket Create",
    ticketClose: "Ticket Close",
    ticketReopen: "Ticket Reopen",
    ticketClaim: "Ticket Claim",
    ticketUnclaim: "Ticket Unclaim",
    ticketPriority: "Ticket Priority",
    ticketUserAdd: "Ticket User Add",
    ticketUserRemove: "Ticket User Remove",
    ticketTransfer: "Ticket Transfer",
    securityViolation: "Security Violation",
}

export const CATEGORY_META: {
    key: RoutableCategory
    label: string
    short: string
    blurb: string
    events: EventKey[]
}[] = [
    {
        key: "moderation",
        label: "Moderation",
        short: "Mod",
        blurb: "Discord audit actions: bans, kicks, timeouts",
        events: ["ban", "unban", "kick", "memberTimeout", "memberUntimeout"],
    },
    {
        key: "modCommands",
        label: "Mod Commands",
        short: "Cmds",
        blurb: "Bot moderation command executions (ban, mute, purge, …)",
        events: ["modCommand"],
    },
    {
        key: "messages",
        label: "Messages",
        short: "Msgs",
        blurb: "Message deletes and edits",
        events: ["messageDelete", "messageEdit"],
    },
    {
        key: "members",
        label: "Members",
        short: "Members",
        blurb: "Joins, leaves, nicknames, role adds/removes",
        events: ["memberJoin", "memberLeave", "nicknameUpdate", "memberRoleAdd", "memberRoleRemove"],
    },
    {
        key: "server",
        label: "Server",
        short: "Server",
        blurb: "Roles, channels, and server settings",
        events: ["roleCreate", "roleDelete", "roleUpdate", "channelCreate", "channelDelete", "channelUpdate", "serverUpdate"],
    },
    {
        key: "expressions",
        label: "Expressions",
        short: "Emoji",
        blurb: "Emoji and soundboard (shared channel; optional splits available)",
        events: ["emojiCreate", "emojiUpdate", "emojiDelete", "soundboardCreate", "soundboardUpdate", "soundboardDelete"],
    },
    {
        key: "voice",
        label: "Voice",
        short: "Voice",
        blurb: "Voice join, leave, move, mute, deafen, kick",
        events: ["voiceJoin", "voiceLeave", "voiceMove", "voiceKick", "voiceMute", "voiceDeafen"],
    },
    {
        key: "verification",
        label: "Verification",
        short: "Verify",
        blurb: "Member verification events",
        events: ["verification"],
    },
    {
        key: "autorole",
        label: "Autorole",
        short: "Auto",
        blurb: "Auto-role assignments",
        events: ["autorole"],
    },
    {
        key: "tickets",
        label: "Tickets",
        short: "Tickets",
        blurb: "Ticket system events",
        events: [
            "ticketCreate",
            "ticketClose",
            "ticketReopen",
            "ticketClaim",
            "ticketUnclaim",
            "ticketPriority",
            "ticketUserAdd",
            "ticketUserRemove",
            "ticketTransfer",
        ],
    },
    {
        key: "security",
        label: "Security",
        short: "Sec",
        blurb: "Security violations and nuke attempts",
        events: ["securityViolation"],
    },
]

export const CHANNEL_KEYS: ChannelKey[] = [...ROUTABLE_CATEGORIES, "emoji", "soundboard"]
export const EVENT_KEYS = Object.keys(EVENT_LABELS) as EventKey[]

function emptyChannels(): Record<ChannelKey, string | null> {
    return Object.fromEntries(CHANNEL_KEYS.map(k => [k, null])) as Record<ChannelKey, string | null>
}

function emptyEventChannels(): Record<EventKey, string | null> {
    return Object.fromEntries(EVENT_KEYS.map(k => [k, null])) as Record<EventKey, string | null>
}

function defaultEvents(): Record<EventKey, boolean> {
    const out = Object.fromEntries(EVENT_KEYS.map(k => [k, true])) as Record<EventKey, boolean>
    out.verification = false
    out.autorole = false
    return out
}

export function normalizeLoggingConfig(
    raw: (Partial<LoggingConfig> & Record<string, unknown>) | null | undefined,
): LoggingConfig {
    const legacyMode = (raw?.mode as LoggingConfig["mode"]) || "single"
    const migrated = Boolean(raw?.categoryRoutingMigrated)
    const categoryModes = {
        ...buildMigratedCategoryModes(migrated ? "multi" : legacyMode),
        ...(raw?.categoryModes as LoggingConfig["categoryModes"] | undefined),
    }

    let fallbackOnly = Boolean(raw?.fallbackOnly)
    if (!migrated && legacyMode === "single") fallbackOnly = true

    return {
        enabled: Boolean(raw?.enabled),
        mode: legacyMode,
        categoryModes,
        categoryRoutingMigrated: true,
        fallbackOnly,
        channelId: (raw?.channelId as string | null) ?? null,
        channels: { ...emptyChannels(), ...(raw?.channels || {}) },
        eventChannels: { ...emptyEventChannels(), ...(raw?.eventChannels || {}) },
        events: { ...defaultEvents(), ...(raw?.events || {}) },
    }
}

export function countEnabledEvents(config: LoggingConfig, events: EventKey[]) {
    return events.filter(e => config.events[e]).length
}
