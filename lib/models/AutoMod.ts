import mongoose from "mongoose"

/**
 * AutoMod settings, shared with the bot (same collection). Discord's built-in AutoMod enforces most of it;
 * Demon's own checks cover smart words, scam links, duplicates, caps, emoji/line limits, zalgo and strikes.
 */
const autoModSchema = new mongoose.Schema(
    {
        guildId: { type: String, required: true, unique: true, index: true },
        enabled: { type: Boolean, default: false },

        // Enforced by Discord's built-in AutoMod when nativeSynced
        blockedWords: { type: [String], default: [] },
        smartWords: { type: [String], default: [] },
        blockInvites: { type: Boolean, default: false },
        blockLinks: { type: Boolean, default: false },
        regexPatterns: { type: [String], default: [] },
        presets: { type: [Number], default: [] },
        maxMentions: { type: Number, default: 0, min: 0, max: 50 },
        raidProtection: { type: Boolean, default: false },
        antiSpam: { type: Boolean, default: false },
        ignoredChannels: { type: [String], default: [] },
        ignoredRoles: { type: [String], default: [] },
        nativeSynced: { type: Boolean, default: false },

        // Demon's custom layer
        allowedDomains: { type: [String], default: [] },
        scamProtection: { type: Boolean, default: false },
        blockDuplicates: { type: Boolean, default: false },
        maxCapsPercent: { type: Number, default: 0, min: 0, max: 100 },
        maxEmojis: { type: Number, default: 0, min: 0, max: 100 },
        maxLines: { type: Number, default: 0, min: 0, max: 100 },
        blockZalgo: { type: Boolean, default: false },

        // Escalation
        strikeLimit: { type: Number, default: 0, min: 0, max: 20 },
        strikeTimeoutMin: { type: Number, default: 10, min: 1, max: 1440 },
    },
    { timestamps: true }
)

export default mongoose.models.AutoMod || mongoose.model("AutoMod", autoModSchema)
