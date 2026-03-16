import mongoose from "mongoose"

const loggingSchema = new mongoose.Schema({
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
    mode: {
        type: String,
        enum: ['single', 'multi', 'granular'],
        default: 'single'
    },
    channelId: {
        type: String,
        default: null
    },
    channels: {
        moderation:   { type: String, default: null },  // bans, kicks, mod commands
        messages:     { type: String, default: null },  // deletes, edits
        members:      { type: String, default: null },  // joins, leaves, nickname, role changes
        server:       { type: String, default: null },  // roles, channels
        verification: { type: String, default: null },  // verification events
        autorole:     { type: String, default: null },  // auto-role assignments
        voice:        { type: String, default: null },  // voice kicks, mutes, deafens
        tickets:      { type: String, default: null },  // ticket system events
        security:     { type: String, default: null }   // security violation events
    },
    eventChannels: {
        memberJoin:       { type: String, default: null },
        memberLeave:      { type: String, default: null },
        ban:              { type: String, default: null },
        unban:            { type: String, default: null },
        kick:             { type: String, default: null },
        messageDelete:    { type: String, default: null },
        messageEdit:      { type: String, default: null },
        modCommand:       { type: String, default: null },
        verification:     { type: String, default: null },
        autorole:         { type: String, default: null },
        roleCreate:       { type: String, default: null },
        roleDelete:       { type: String, default: null },
        roleUpdate:       { type: String, default: null },
        channelCreate:    { type: String, default: null },
        channelDelete:    { type: String, default: null },
        channelUpdate:    { type: String, default: null },
        serverUpdate:     { type: String, default: null },
        nicknameUpdate:   { type: String, default: null },
        memberRoleAdd:    { type: String, default: null },
        memberRoleRemove: { type: String, default: null },
        memberTimeout:    { type: String, default: null },
        memberUntimeout:  { type: String, default: null },
        voiceKick:        { type: String, default: null },
        voiceDeafen:      { type: String, default: null },
        voiceMute:        { type: String, default: null },
        ticketCreate:     { type: String, default: null },
        ticketClose:      { type: String, default: null },
        ticketReopen:     { type: String, default: null },
        ticketClaim:      { type: String, default: null },
        ticketUnclaim:    { type: String, default: null },
        ticketPriority:   { type: String, default: null },
        ticketUserAdd:    { type: String, default: null },
        ticketUserRemove: { type: String, default: null },
        ticketTransfer:   { type: String, default: null },
        securityViolation:{ type: String, default: null }
    },
    events: {
        memberJoin:       { type: Boolean, default: true  },
        memberLeave:      { type: Boolean, default: true  },
        ban:              { type: Boolean, default: true  },
        unban:            { type: Boolean, default: true  },
        kick:             { type: Boolean, default: true  },
        messageDelete:    { type: Boolean, default: true  },
        messageEdit:      { type: Boolean, default: true  },
        modCommand:       { type: Boolean, default: true  },
        verification:     { type: Boolean, default: false },
        autorole:         { type: Boolean, default: false },
        roleCreate:       { type: Boolean, default: true  },
        roleDelete:       { type: Boolean, default: true  },
        roleUpdate:       { type: Boolean, default: true  },
        channelCreate:    { type: Boolean, default: true  },
        channelDelete:    { type: Boolean, default: true  },
        channelUpdate:    { type: Boolean, default: true  },
        ticketCreate:     { type: Boolean, default: true  },
        ticketClose:      { type: Boolean, default: true  },
        ticketReopen:     { type: Boolean, default: true  },
        ticketClaim:      { type: Boolean, default: true  },
        ticketUnclaim:    { type: Boolean, default: true  },
        ticketPriority:   { type: Boolean, default: true  },
        ticketUserAdd:    { type: Boolean, default: true  },
        ticketUserRemove: { type: Boolean, default: true  },
        ticketTransfer:   { type: Boolean, default: true  },
        serverUpdate:     { type: Boolean, default: true  },
        nicknameUpdate:   { type: Boolean, default: true  },
        memberRoleAdd:    { type: Boolean, default: true  },
        memberRoleRemove: { type: Boolean, default: true  },
        memberTimeout:    { type: Boolean, default: true  },
        memberUntimeout:  { type: Boolean, default: true  },
        voiceKick:        { type: Boolean, default: true  },
        voiceDeafen:      { type: Boolean, default: true  },
        voiceMute:        { type: Boolean, default: true  },
        securityViolation:{ type: Boolean, default: true  }
    }
}, { timestamps: true })

export default mongoose.models.Logging || mongoose.model("Logging", loggingSchema)
