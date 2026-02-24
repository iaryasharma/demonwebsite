import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUser extends Document {
    userId: string
    guildId: string
    xp: number
    level: number
    coins: number
    badges: string[]
    createdAt: Date
    updatedAt: Date
}

const userSchema = new Schema<IUser>(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        guildId: {
            type: String,
            required: true,
            index: true,
        },
        xp: {
            type: Number,
            default: 0,
        },
        level: {
            type: Number,
            default: 1,
        },
        coins: {
            type: Number,
            default: 0,
        },
        badges: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
)

// Compound unique index
userSchema.index({ userId: 1, guildId: 1 }, { unique: true })

export const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", userSchema)
