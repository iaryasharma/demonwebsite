import mongoose from "mongoose"

/** Anti-raid settings, shared with the bot (same collection). */
const raidProtectionSchema = new mongoose.Schema(
    {
        guildId: { type: String, required: true, unique: true, index: true },
        enabled: { type: Boolean, default: false },
        joinThreshold: { type: Number, default: 8, min: 2, max: 100 },
        windowSeconds: { type: Number, default: 20, min: 5, max: 300 },
        raidDurationMin: { type: Number, default: 10, min: 1, max: 120 },
        minAccountAgeDays: { type: Number, default: 7, min: 0, max: 365 },
        action: { type: String, enum: ["alert", "timeout", "kick", "ban"], default: "kick" },
    },
    { timestamps: true }
)

export default mongoose.models.RaidProtection || mongoose.model("RaidProtection", raidProtectionSchema)
