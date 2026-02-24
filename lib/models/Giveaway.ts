import mongoose, { Schema, Document, Model } from "mongoose"

export interface IGiveaway extends Document {
    messageId: string
    channelId: string
    guildId: string
    hostId: string
    prize: string
    description: string | null
    requiredRole: string | null
    winnerCount: number
    duration: number
    startTime: Date
    endTime: Date
    participants: string[]
    winners: string[]
    isActive: boolean
    isEnded: boolean
    endedBy: string | null
    endedAt: Date | null
    createdAt: Date
    updatedAt: Date
    // Instance methods
    endGiveaway(endedBy?: string): Promise<{ success: boolean; winners?: string[]; reason?: string }>
    rerollWinners(): Promise<{ success: boolean; winners?: string[]; reason?: string }>
    canReroll(): { allowed: boolean; reason: string | null }
    selectWinners(): string[]
}

export interface IGiveawayModel extends Model<IGiveaway> {
    findExpiredGiveaways(): Promise<IGiveaway[]>
    getActiveGiveaways(guildId: string): Promise<IGiveaway[]>
}

const giveawaySchema = new Schema<IGiveaway>(
    {
        messageId: { type: String, required: true, index: true },
        channelId: { type: String, required: true },
        guildId: { type: String, required: true, index: true },
        hostId: { type: String, required: true },
        prize: { type: String, required: true, maxlength: 256 },
        description: { type: String, default: null, maxlength: 1000 },
        requiredRole: { type: String, default: null },
        winnerCount: { type: Number, required: true, min: 1, max: 50, default: 1 },
        duration: { type: Number, required: true },
        startTime: { type: Date, required: true, default: Date.now },
        endTime: { type: Date, required: true, index: true },
        participants: { type: [String], default: [] },
        winners: { type: [String], default: [] },
        isActive: { type: Boolean, default: true, index: true },
        isEnded: { type: Boolean, default: false },
        endedBy: { type: String, default: null },
        endedAt: { type: Date, default: null },
    },
    {
        timestamps: true,
        collection: "giveaways",
    }
)

// Compound indexes
giveawaySchema.index({ guildId: 1, isActive: 1 })
giveawaySchema.index({ isActive: 1, endTime: 1 })

// Static: find expired giveaways
giveawaySchema.statics.findExpiredGiveaways = async function () {
    return this.find({
        isActive: true,
        isEnded: false,
        endTime: { $lte: new Date() },
    })
}

// Static: get active giveaways for guild
giveawaySchema.statics.getActiveGiveaways = async function (guildId: string) {
    return this.find({
        guildId,
        isActive: true,
        isEnded: false,
    }).sort({ endTime: 1 })
}

// Instance: select random winners
giveawaySchema.methods.selectWinners = function (): string[] {
    if (this.participants.length === 0) return []

    const available = [...this.participants]
    const winners: string[] = []
    const max = Math.min(this.winnerCount, available.length)

    for (let i = 0; i < max; i++) {
        const idx = Math.floor(Math.random() * available.length)
        winners.push(available.splice(idx, 1)[0])
    }

    return winners
}

// Instance: end giveaway and select winners
giveawaySchema.methods.endGiveaway = async function (
    endedBy: string = "dashboard"
): Promise<{ success: boolean; winners?: string[]; reason?: string }> {
    if (this.isEnded) {
        return { success: false, reason: "Giveaway already ended" }
    }

    const winners = this.selectWinners()

    await (this.constructor as IGiveawayModel).updateOne(
        { _id: this._id },
        {
            $set: {
                isActive: false,
                isEnded: true,
                endedBy,
                endedAt: new Date(),
                winners,
            },
        }
    )

    // Update local instance
    this.isActive = false
    this.isEnded = true
    this.endedBy = endedBy
    this.endedAt = new Date()
    this.winners = winners

    return { success: true, winners }
}

// Instance: reroll winners
giveawaySchema.methods.rerollWinners = async function (): Promise<{
    success: boolean
    winners?: string[]
    reason?: string
}> {
    if (!this.isEnded) {
        return { success: false, reason: "Giveaway is still active" }
    }

    if (this.participants.length === 0) {
        return { success: false, reason: "No participants to reroll" }
    }

    // 36-hour reroll limit
    const thirtySixHoursAgo = new Date(Date.now() - 36 * 60 * 60 * 1000)
    if (this.endedAt && this.endedAt < thirtySixHoursAgo) {
        return {
            success: false,
            reason: "Reroll period expired (36 hours limit)",
        }
    }

    const newWinners = this.selectWinners()

    await (this.constructor as IGiveawayModel).updateOne(
        { _id: this._id },
        { $set: { winners: newWinners } }
    )

    this.winners = newWinners
    return { success: true, winners: newWinners }
}

// Instance: check if reroll is allowed
giveawaySchema.methods.canReroll = function (): {
    allowed: boolean
    reason: string | null
} {
    if (!this.isEnded) {
        return { allowed: false, reason: "Giveaway is still active" }
    }

    if (this.participants.length === 0) {
        return { allowed: false, reason: "No participants to reroll" }
    }

    const thirtySixHoursAgo = new Date(Date.now() - 36 * 60 * 60 * 1000)
    if (this.endedAt && this.endedAt < thirtySixHoursAgo) {
        return {
            allowed: false,
            reason: "Reroll period expired. Rerolls are only allowed within 36 hours of giveaway ending.",
        }
    }

    return { allowed: true, reason: null }
}

const Giveaway: IGiveawayModel =
    (mongoose.models.Giveaway as IGiveawayModel) ||
    mongoose.model<IGiveaway, IGiveawayModel>("Giveaway", giveawaySchema)

export default Giveaway
