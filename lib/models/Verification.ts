import mongoose from "mongoose"

const verificationSchema = new mongoose.Schema({
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
    channelId: {
        type: String,
        default: null
    },
    roleId: {
        type: String,
        default: null
    },
    unverifiedRoleId: {
        type: String,
        default: null
    },
    messageId: {
        type: String,
        default: null
    },
    embedTitle: {
        type: String,
        default: '✅ Server Verification'
    },
    embedDescription: {
        type: String,
        default: 'Click the button below to verify yourself and gain access to the server!'
    },
    embedColor: {
        type: String,
        default: '#57F287'
    },
    buttonLabel: {
        type: String,
        default: 'Verify'
    },
    verifiedMessage: {
        type: String,
        default: 'You have been verified! Welcome to {server}! 🎉'
    },
    kickUnverified: {
        type: Boolean,
        default: false
    },
    kickTimeout: {
        type: Number,
        default: 600 // 10 minutes in seconds
    },
    type: {
        type: String,
        enum: ['button', 'code', 'captcha'],
        default: 'button'
    },
    minAccountAge: {
        type: Number,
        default: 0  // days; 0 = no requirement
    },
    logChannelId: {
        type: String,
        default: null
    }
}, { timestamps: true })

export default mongoose.models.Verification || mongoose.model("Verification", verificationSchema)
