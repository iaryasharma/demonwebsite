import mongoose from "mongoose"

export interface ITicket extends mongoose.Document {
    ticketId: string
    guildId: string
    panelId: string
    typeId: string
    channelId: string
    userId: string
    claimedBy: string | null
    status: 'open' | 'closed' | 'locked'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    reason: string | null
    closeReason: string | null
    addedUsers: string[]
    transcriptURL: string | null
    messageCount: number
    lastActivityAt: Date
    createdAt: Date
    closedAt: Date | null
    closedBy: string | null
    closeTicket(closedBy: string, reason?: string): Promise<ITicket>
    lockTicket(): Promise<ITicket>
    unlockTicket(): Promise<ITicket>
    claimTicket(userId: string): Promise<ITicket>
    unclaimTicket(): Promise<ITicket>
    changePriority(priority: 'low' | 'medium' | 'high' | 'urgent'): Promise<ITicket>
    addUser(userId: string): Promise<ITicket>
    removeUser(userId: string): Promise<ITicket>
}

export interface ITicketModel extends mongoose.Model<ITicket> {
    generateTicketId(): string
    findByTicketId(ticketId: string): Promise<ITicket | null>
    findByChannelId(channelId: string): Promise<ITicket | null>
    getUserActiveTickets(guildId: string, userId: string, typeId: string): Promise<ITicket[]>
    getGuildActiveTickets(guildId: string): Promise<ITicket[]>
    getTicketsByStatus(guildId: string, status: 'open' | 'closed' | 'locked'): Promise<ITicket[]>
    getGuildTickets(guildId: string): Promise<ITicket[]>
    getGuildTicketsByPanel(guildId: string, panelId: string): Promise<ITicket[]>
}

const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    guildId: {
        type: String,
        required: true,
        index: true
    },
    panelId: {
        type: String,
        required: true,
        index: true
    },
    typeId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    claimedBy: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'locked'],
        default: 'open',
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'low'
    },
    reason: {
        type: String,
        default: null,
        maxlength: 500
    },
    closeReason: {
        type: String,
        default: null,
        maxlength: 500
    },
    addedUsers: [{
        type: String
    }],
    transcriptURL: {
        type: String,
        default: null
    },
    messageCount: {
        type: Number,
        default: 0
    },
    lastActivityAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    closedAt: {
        type: Date,
        default: null
    },
    closedBy: {
        type: String,
        default: null
    }
}, {
    timestamps: true
})

// Compound indexes for common queries
ticketSchema.index({ guildId: 1, status: 1 })
ticketSchema.index({ guildId: 1, userId: 1, status: 1 })
ticketSchema.index({ panelId: 1, typeId: 1 })

// Static methods
ticketSchema.statics.generateTicketId = function(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5).toUpperCase()
    return `TICKET-${timestamp}-${random}`
}

ticketSchema.statics.findByTicketId = async function(ticketId: string): Promise<ITicket | null> {
    return await this.findOne({ ticketId })
}

ticketSchema.statics.findByChannelId = async function(channelId: string): Promise<ITicket | null> {
    return await this.findOne({ channelId })
}

ticketSchema.statics.getUserActiveTickets = async function(guildId: string, userId: string, typeId: string): Promise<ITicket[]> {
    return await this.find({
        guildId,
        userId,
        typeId,
        status: 'open'
    })
}

ticketSchema.statics.getGuildActiveTickets = async function(guildId: string): Promise<ITicket[]> {
    return await this.find({
        guildId,
        status: 'open'
    }).sort({ createdAt: -1 })
}

ticketSchema.statics.getTicketsByStatus = async function(guildId: string, status: 'open' | 'closed' | 'locked'): Promise<ITicket[]> {
    return await this.find({
        guildId,
        status
    }).sort({ createdAt: -1 })
}

ticketSchema.statics.getGuildTickets = async function(guildId: string): Promise<ITicket[]> {
    return await this.find({ guildId }).sort({ createdAt: -1 })
}

ticketSchema.statics.getGuildTicketsByPanel = async function(guildId: string, panelId: string): Promise<ITicket[]> {
    return await this.find({ guildId, panelId }).sort({ createdAt: -1 })
}

// Instance methods
ticketSchema.methods.closeTicket = function(closedBy: string, reason: string | null = null): Promise<ITicket> {
    this.status = 'closed'
    this.closedAt = new Date()
    this.closedBy = closedBy
    if (reason) this.closeReason = reason
    return this.save()
}

ticketSchema.methods.lockTicket = function(): Promise<ITicket> {
    this.status = 'locked'
    return this.save()
}

ticketSchema.methods.unlockTicket = function(): Promise<ITicket> {
    this.status = 'open'
    return this.save()
}

ticketSchema.methods.claimTicket = function(userId: string): Promise<ITicket> {
    this.claimedBy = userId
    return this.save()
}

ticketSchema.methods.unclaimTicket = function(): Promise<ITicket> {
    this.claimedBy = null
    return this.save()
}

ticketSchema.methods.changePriority = function(priority: 'low' | 'medium' | 'high' | 'urgent'): Promise<ITicket> {
    this.priority = priority
    return this.save()
}

ticketSchema.methods.addUser = function(userId: string): Promise<ITicket> {
    if (!this.addedUsers.includes(userId)) {
        this.addedUsers.push(userId)
    }
    return this.save()
}

ticketSchema.methods.removeUser = function(userId: string): Promise<ITicket> {
    this.addedUsers = this.addedUsers.filter((id: string) => id !== userId)
    return this.save()
}

export default (mongoose.models.Ticket as ITicketModel) || mongoose.model<ITicket, ITicketModel>("Ticket", ticketSchema)
