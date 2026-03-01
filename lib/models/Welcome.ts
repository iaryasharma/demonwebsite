import mongoose from "mongoose"

const welcomeSchema = new mongoose.Schema({
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
    message: {
        type: String,
        default: 'Welcome {user} to {server}! 🎉\nYou are member #{memberCount}'
    },
    embedEnabled: {
        type: Boolean,
        default: false
    },
    embedColor: {
        type: String,
        default: '#5865F2'
    },
    embedTitle: {
        type: String,
        default: 'Welcome to {server}!'
    },
    embedDescription: {
        type: String,
        default: 'Welcome {user}! 🎉\n\nYou are member #{memberCount}\nAccount created: {accountAge}'
    },
    embedImage: {
        type: String,
        default: null
    },
    embedThumbnail: {
        type: Boolean,
        default: true
    },
    embedFooter: {
        type: String,
        default: 'Enjoy your stay!'
    },
    dmEnabled: {
        type: Boolean,
        default: false
    },
    dmMessage: {
        type: String,
        default: 'Welcome to {server}! We are glad to have you here! 🎉'
    },
    imageEnabled: {
        type: Boolean,
        default: false
    },
    imageTemplate: {
        type: String,
        default: 'default'
    },
    embedChannelId: {
        type: String,
        default: null
    },
    plainEnabled: {
        type: Boolean,
        default: false
    },
    plainChannelId: {
        type: String,
        default: null
    }
}, {
    timestamps: true
})

export default mongoose.models.Welcome || mongoose.model("Welcome", welcomeSchema)
