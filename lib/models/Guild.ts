import mongoose, { Schema, Document, Model } from "mongoose"

export interface IWebhook {
    name: string
    url: string
    createdAt: Date
}

export interface IGuildSettings {
    welcome?: {
        enabled?: boolean
        channelId?: string
        message?: string
    }
    leave?: {
        enabled?: boolean
        channelId?: string
        message?: string
    }
    moderation?: {
        enabled?: boolean
        logChannelId?: string
        automod?: boolean
        antiSpam?: boolean
        antiLinks?: boolean
    }
    leveling?: {
        enabled?: boolean
        channelId?: string
        message?: string
    }
    [key: string]: any
}

export interface IGuild extends Document {
    guildId: string
    prefix: string
    settings: IGuildSettings
    webhooks: IWebhook[]
    createdAt: Date
    updatedAt: Date
}

const guildSchema = new Schema<IGuild>(
    {
        guildId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        prefix: {
            type: String,
            default: "!!",
        },
        settings: {
            type: Object,
            default: {},
        },
        webhooks: {
            type: [
                {
                    name: { type: String, required: true },
                    url: { type: String, required: true },
                    createdAt: { type: Date, default: Date.now },
                },
            ],
            default: [],
        },
    },
    { timestamps: true }
)

// Prevent model recompilation in dev (hot reload)
export const Guild: Model<IGuild> =
    mongoose.models.Guild || mongoose.model<IGuild>("Guild", guildSchema)
