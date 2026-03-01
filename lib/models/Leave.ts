import mongoose from "mongoose"

const leaveSchema = new mongoose.Schema({
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
        default: '{username} has left {server}.\nWe now have {memberCount} members.'
    },
    embedEnabled: {
        type: Boolean,
        default: false
    },
    embedColor: {
        type: String,
        default: '#ED4245'
    },
    embedTitle: {
        type: String,
        default: 'Member Left'
    },
    embedDescription: {
        type: String,
        default: '{username} has left the server.\n\nMember Count: {memberCount}'
    },
    embedFooter: {
        type: String,
        default: 'Goodbye!'
    },
    embedThumbnail: {
        type: Boolean,
        default: false
    },
    embedImage: {
        type: String,
        default: null
    },
    logEnabled: {
        type: Boolean,
        default: false
    },
    logChannelId: {
        type: String,
        default: null
    },
    showJoinDate: {
        type: Boolean,
        default: true
    },
    showAccountAge: {
        type: Boolean,
        default: true
    },
    showRoles: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

export default mongoose.models.Leave || mongoose.model("Leave", leaveSchema)
