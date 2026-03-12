import mongoose from "mongoose"

export interface ITicketType {
    typeId: string
    label: string
    description?: string
    emoji?: string
    categoryId: string
    staffRoles: string[]
    logChannelId?: string
    maxActiveTickets: number
    cooldownMinutes: number
}

export interface ITicketPanel extends mongoose.Document {
    guildId: string
    panelId: string
    channelId: string
    messageId: string | null
    title: string
    description: string
    ticketTypes: ITicketType[]
    enabled: boolean
    createdAt: Date
    updatedAt: Date
    addTicketType(typeData: Partial<ITicketType> & Pick<ITicketType, 'label' | 'categoryId'>): Promise<ITicketPanel>
    removeTicketType(typeId: string): Promise<ITicketPanel>
    getTicketType(typeId: string): ITicketType | undefined
}

export interface ITicketPanelModel extends mongoose.Model<ITicketPanel> {
    generatePanelId(): string
    generateTypeId(): string
    findByPanelId(guildId: string, panelId: string): Promise<ITicketPanel | null>
    getGuildPanels(guildId: string): Promise<ITicketPanel[]>
}

const ticketTypeSchema = new mongoose.Schema({
    typeId: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true,
        maxlength: 100
    },
    description: {
        type: String,
        maxlength: 100
    },
    emoji: {
        type: String,
        default: null
    },
    categoryId: {
        type: String,
        required: true
    },
    staffRoles: [{
        type: String
    }],
    logChannelId: {
        type: String,
        default: null
    },
    maxActiveTickets: {
        type: Number,
        default: 1
    },
    cooldownMinutes: {
        type: Number,
        default: 0
    }
}, { _id: false })

const ticketPanelSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        index: true
    },
    panelId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    channelId: {
        type: String,
        required: true
    },
    messageId: {
        type: String,
        default: null
    },
    title: {
        type: String,
        required: true,
        maxlength: 256
    },
    description: {
        type: String,
        default: 'Select a ticket type below to get started.',
        maxlength: 4000
    },
    ticketTypes: [ticketTypeSchema],
    enabled: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

// Compound indexes
ticketPanelSchema.index({ guildId: 1, panelId: 1 })
ticketPanelSchema.index({ guildId: 1, channelId: 1 })

// Static methods
ticketPanelSchema.statics.generatePanelId = function(): string {
    return `panel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

ticketPanelSchema.statics.generateTypeId = function(): string {
    return `type-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

ticketPanelSchema.statics.findByPanelId = async function(guildId: string, panelId: string): Promise<ITicketPanel | null> {
    return await this.findOne({ guildId, panelId })
}

ticketPanelSchema.statics.getGuildPanels = async function(guildId: string): Promise<ITicketPanel[]> {
    return await this.find({ guildId }).sort({ createdAt: -1 })
}

// Instance methods
ticketPanelSchema.methods.addTicketType = function(typeData: Partial<ITicketType> & Pick<ITicketType, 'label' | 'categoryId'>): Promise<ITicketPanel> {
    const typeId = (this.constructor as ITicketPanelModel).generateTypeId()
    this.ticketTypes.push({
        typeId,
        label: typeData.label,
        description: typeData.description || '',
        emoji: typeData.emoji || null,
        categoryId: typeData.categoryId,
        staffRoles: typeData.staffRoles || [],
        logChannelId: typeData.logChannelId || null,
        maxActiveTickets: typeData.maxActiveTickets || 1,
        cooldownMinutes: typeData.cooldownMinutes || 0
    } as ITicketType)
    this.updatedAt = new Date()
    return this.save()
}

ticketPanelSchema.methods.removeTicketType = function(typeId: string): Promise<ITicketPanel> {
    this.ticketTypes = this.ticketTypes.filter((t: ITicketType) => t.typeId !== typeId)
    this.updatedAt = new Date()
    return this.save()
}

ticketPanelSchema.methods.getTicketType = function(typeId: string): ITicketType | undefined {
    return this.ticketTypes.find((t: ITicketType) => t.typeId === typeId)
}

export default (mongoose.models.TicketPanel as ITicketPanelModel) || mongoose.model<ITicketPanel, ITicketPanelModel>("TicketPanel", ticketPanelSchema)
