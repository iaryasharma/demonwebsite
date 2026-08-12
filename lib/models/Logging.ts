import mongoose from "mongoose"
import {
    buildMigratedCategoryModes,
    type CategoryRoutingMode,
} from "@/lib/logging-constants"

export {
    ROUTABLE_CATEGORIES,
    buildMigratedCategoryModes,
} from "@/lib/logging-constants"
export type { RoutableCategory, CategoryRoutingMode } from "@/lib/logging-constants"

const categoryModeField = {
    type: String,
    enum: ["category", "granular"] as CategoryRoutingMode[],
    default: "category" as CategoryRoutingMode,
}

const loggingSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    enabled: {
        type: Boolean,
        default: false,
    },
    /**
     * @deprecated Global routing — kept for migration of older docs only.
     * Prefer `categoryModes` after `categoryRoutingMigrated`.
     */
    mode: {
        type: String,
        enum: ["single", "multi", "granular"],
        default: "single",
    },
    /** Per-category routing: category channel vs optional per-event channels */
    categoryModes: {
        moderation: categoryModeField,
        modCommands: categoryModeField,
        messages: categoryModeField,
        members: categoryModeField,
        server: categoryModeField,
        expressions: categoryModeField,
        voice: categoryModeField,
        verification: categoryModeField,
        autorole: categoryModeField,
        tickets: categoryModeField,
        security: categoryModeField,
    },
    /** True after legacy global `mode` mapped into `categoryModes`. */
    categoryRoutingMigrated: {
        type: Boolean,
        default: false,
    },
    /**
     * When true (migrated from global single), ignore category/event channels
     * and always use `channelId`.
     */
    fallbackOnly: {
        type: Boolean,
        default: false,
    },
    channelId: {
        type: String,
        default: null,
    },
    channels: {
        moderation: { type: String, default: null },
        modCommands: { type: String, default: null },
        messages: { type: String, default: null },
        members: { type: String, default: null },
        server: { type: String, default: null },
        expressions: { type: String, default: null },
        emoji: { type: String, default: null },
        soundboard: { type: String, default: null },
        voice: { type: String, default: null },
        verification: { type: String, default: null },
        autorole: { type: String, default: null },
        tickets: { type: String, default: null },
        security: { type: String, default: null },
    },
    eventChannels: {
        memberJoin: { type: String, default: null },
        memberLeave: { type: String, default: null },
        ban: { type: String, default: null },
        unban: { type: String, default: null },
        kick: { type: String, default: null },
        messageDelete: { type: String, default: null },
        messageEdit: { type: String, default: null },
        modCommand: { type: String, default: null },
        verification: { type: String, default: null },
        autorole: { type: String, default: null },
        roleCreate: { type: String, default: null },
        roleDelete: { type: String, default: null },
        roleUpdate: { type: String, default: null },
        channelCreate: { type: String, default: null },
        channelDelete: { type: String, default: null },
        channelUpdate: { type: String, default: null },
        emojiCreate: { type: String, default: null },
        emojiUpdate: { type: String, default: null },
        emojiDelete: { type: String, default: null },
        soundboardCreate: { type: String, default: null },
        soundboardUpdate: { type: String, default: null },
        soundboardDelete: { type: String, default: null },
        serverUpdate: { type: String, default: null },
        nicknameUpdate: { type: String, default: null },
        memberRoleAdd: { type: String, default: null },
        memberRoleRemove: { type: String, default: null },
        voiceJoin: { type: String, default: null },
        voiceLeave: { type: String, default: null },
        voiceMove: { type: String, default: null },
        voiceKick: { type: String, default: null },
        voiceDeafen: { type: String, default: null },
        voiceMute: { type: String, default: null },
        memberTimeout: { type: String, default: null },
        memberUntimeout: { type: String, default: null },
        ticketCreate: { type: String, default: null },
        ticketClose: { type: String, default: null },
        ticketReopen: { type: String, default: null },
        ticketClaim: { type: String, default: null },
        ticketUnclaim: { type: String, default: null },
        ticketPriority: { type: String, default: null },
        ticketUserAdd: { type: String, default: null },
        ticketUserRemove: { type: String, default: null },
        ticketTransfer: { type: String, default: null },
        securityViolation: { type: String, default: null },
    },
    events: {
        memberJoin: { type: Boolean, default: true },
        memberLeave: { type: Boolean, default: true },
        ban: { type: Boolean, default: true },
        unban: { type: Boolean, default: true },
        kick: { type: Boolean, default: true },
        messageDelete: { type: Boolean, default: true },
        messageEdit: { type: Boolean, default: true },
        modCommand: { type: Boolean, default: true },
        verification: { type: Boolean, default: false },
        autorole: { type: Boolean, default: false },
        roleCreate: { type: Boolean, default: true },
        roleDelete: { type: Boolean, default: true },
        roleUpdate: { type: Boolean, default: true },
        channelCreate: { type: Boolean, default: true },
        channelDelete: { type: Boolean, default: true },
        channelUpdate: { type: Boolean, default: true },
        emojiCreate: { type: Boolean, default: true },
        emojiUpdate: { type: Boolean, default: true },
        emojiDelete: { type: Boolean, default: true },
        soundboardCreate: { type: Boolean, default: true },
        soundboardUpdate: { type: Boolean, default: true },
        soundboardDelete: { type: Boolean, default: true },
        ticketCreate: { type: Boolean, default: true },
        ticketClose: { type: Boolean, default: true },
        ticketReopen: { type: Boolean, default: true },
        ticketClaim: { type: Boolean, default: true },
        ticketUnclaim: { type: Boolean, default: true },
        ticketPriority: { type: Boolean, default: true },
        ticketUserAdd: { type: Boolean, default: true },
        ticketUserRemove: { type: Boolean, default: true },
        ticketTransfer: { type: Boolean, default: true },
        serverUpdate: { type: Boolean, default: true },
        nicknameUpdate: { type: Boolean, default: true },
        memberRoleAdd: { type: Boolean, default: true },
        memberRoleRemove: { type: Boolean, default: true },
        voiceJoin: { type: Boolean, default: true },
        voiceLeave: { type: Boolean, default: true },
        voiceMove: { type: Boolean, default: true },
        voiceKick: { type: Boolean, default: true },
        voiceDeafen: { type: Boolean, default: true },
        voiceMute: { type: Boolean, default: true },
        memberTimeout: { type: Boolean, default: true },
        memberUntimeout: { type: Boolean, default: true },
        securityViolation: { type: Boolean, default: true },
    },
}, { timestamps: true })

loggingSchema.methods.ensureCategoryRouting = async function ensureCategoryRouting() {
    if (this.categoryRoutingMigrated) return this
    const legacyMode = this.mode || "single"
    this.set("categoryModes", buildMigratedCategoryModes(legacyMode))
    this.categoryRoutingMigrated = true
    this.fallbackOnly = legacyMode === "single"
    await this.save()
    return this
}

export default mongoose.models.Logging || mongoose.model("Logging", loggingSchema)
