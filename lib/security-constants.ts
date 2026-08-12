export const PUNISHMENT_OPTIONS = [
  { id: "kick" as const, label: "Kick" },
  { id: "ban" as const, label: "Ban" },
  { id: "quarantine" as const, label: "Quarantine" },
]

export type PunishmentType = (typeof PUNISHMENT_OPTIONS)[number]["id"]

export const EVENT_PUNISHMENT_KEYS = [
  "channelCreate",
  "channelDelete",
  "roleCreate",
  "roleDelete",
  "memberKick",
  "memberBan",
  "prune",
  "botAdd",
  "dangerousRoleGrant",
] as const

export type EventPunishmentKey = (typeof EVENT_PUNISHMENT_KEYS)[number]

export const EVENT_PUNISHMENT_LABELS: Record<EventPunishmentKey, string> = {
  channelCreate: "Channel Create",
  channelDelete: "Channel Delete",
  roleCreate: "Role Create",
  roleDelete: "Role Delete",
  memberKick: "Member Kick",
  memberBan: "Member Ban",
  prune: "Prune",
  botAdd: "Bot Add",
  dangerousRoleGrant: "Dangerous Role Grant",
}

export const PROTECTION_LABELS: Record<string, string> = {
  antiChannelCreate: "Channel Create",
  antiChannelDelete: "Channel Delete",
  antiRoleCreate: "Role Create",
  antiRoleDelete: "Role Delete",
  antiMemberKick: "Member Kick",
  antiMemberBan: "Member Ban",
  antiPrune: "Prune",
  antiBotAdd: "Bot Add",
  antiDangerousRoleGrant: "Dangerous Role Grant",
}

export function emptyEventPunishments(): Record<EventPunishmentKey, PunishmentType | null> {
  return {
    channelCreate: null,
    channelDelete: null,
    roleCreate: null,
    roleDelete: null,
    memberKick: null,
    memberBan: null,
    prune: null,
    botAdd: null,
    dangerousRoleGrant: null,
  }
}

export function normalizePunishmentType(raw: unknown): PunishmentType {
  if (raw === "removeRoles") return "quarantine"
  if (raw === "kick" || raw === "ban" || raw === "quarantine") return raw
  return "ban"
}
