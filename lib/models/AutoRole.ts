import mongoose from "mongoose"

const autoRoleSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    enabled: {
        type: Boolean,
        default: false
    },
    roleIds: {
        type: [String],
        default: []
    },
    delay: {
        type: Number,
        default: 0 // Delay in seconds
    },
    conditions: {
        accountAge: {
            enabled: {
                type: Boolean,
                default: false
            },
            minDays: {
                type: Number,
                default: 7
            }
        },
        verificationRequired: {
            type: Boolean,
            default: false
        }
    },
    logChannelId: {
        type: String,
        default: null
    }
}, { timestamps: true })

export default mongoose.models.AutoRole || mongoose.model("AutoRole", autoRoleSchema)
