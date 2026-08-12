import mongoose from "mongoose"

export const PUNISHMENT_TYPES = ["kick", "ban", "quarantine"] as const
export type PunishmentType = (typeof PUNISHMENT_TYPES)[number]

const eventPunishmentField = {
  type: String,
  enum: [...PUNISHMENT_TYPES, null],
  default: null,
}

const securityConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },

  enabled: { type: Boolean, default: false },
  captchaRequired: { type: Boolean, default: true },

  protections: {
    antiChannelCreate: { type: Boolean, default: false },
    antiChannelDelete: { type: Boolean, default: false },
    antiRoleCreate: { type: Boolean, default: false },
    antiRoleDelete: { type: Boolean, default: false },
    antiMemberKick: { type: Boolean, default: false },
    antiMemberBan: { type: Boolean, default: false },
    antiPrune: { type: Boolean, default: false },
    antiBotAdd: { type: Boolean, default: false },
    antiDangerousRoleGrant: { type: Boolean, default: false },
  },

  limits: {
    channelCreateLimit: { type: Number, default: 5 },
    channelDeleteLimit: { type: Number, default: 5 },
    roleCreateLimit: { type: Number, default: 5 },
    roleDeleteLimit: { type: Number, default: 5 },
    memberKickLimit: { type: Number, default: 3 },
    memberBanLimit: { type: Number, default: 3 },
    botAddLimit: { type: Number, default: 1 },
    timeframe: { type: Number, default: 300 },
  },

  /**
   * Global default punishment.
   * quarantine = strip removable roles + 28d timeout.
   * Legacy removeRoles is kept for old docs and normalized at apply-time.
   */
  punishment: {
    type: {
      type: String,
      enum: ["kick", "ban", "quarantine", "removeRoles"],
      default: "ban",
    },
    rolesToRemove: [String],
  },

  /** Per-event overrides; null = inherit global punishment.type */
  eventPunishments: {
    channelCreate: eventPunishmentField,
    channelDelete: eventPunishmentField,
    roleCreate: eventPunishmentField,
    roleDelete: eventPunishmentField,
    memberKick: eventPunishmentField,
    memberBan: eventPunishmentField,
    prune: eventPunishmentField,
    botAdd: eventPunishmentField,
    dangerousRoleGrant: eventPunishmentField,
  },

  quarantineRoleId: { type: String, default: null },
  dryRun: { type: Boolean, default: false },
  securityLogChannelId: { type: String, default: null },
}, { timestamps: true })

export default mongoose.models.SecurityConfig || mongoose.model("SecurityConfig", securityConfigSchema)
