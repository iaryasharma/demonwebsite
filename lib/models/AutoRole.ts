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
    },
    // Sticky roles: give returning members their previous roles (never elevated ones; skipped while verification is on)
    restoreRoles: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

export default mongoose.models.AutoRole || mongoose.model("AutoRole", autoRoleSchema)
