import mongoose from "mongoose"

export interface ITranscript extends mongoose.Document {
    transcriptId: string
    guildId: string
    ticketId: string
    channelId: string
    html: string
    messageCount: number
    generatedBy: string
    generatedAt: Date
}

export interface ITranscriptModel extends mongoose.Model<ITranscript> {
    generateTranscriptId(): string
    findByTranscriptId(transcriptId: string): Promise<ITranscript | null>
    findByTicketId(ticketId: string): Promise<ITranscript | null>
}

const transcriptSchema = new mongoose.Schema({
    transcriptId: {
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
    ticketId: {
        type: String,
        required: true,
        index: true
    },
    channelId: {
        type: String,
        required: true
    },
    html: {
        type: String,
        required: true
    },
    messageCount: {
        type: Number,
        default: 0
    },
    generatedBy: {
        type: String,
        required: true
    },
    generatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

// Generate unique transcript ID
transcriptSchema.statics.generateTranscriptId = function(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 10)
    return `transcript-${timestamp}-${random}`
}

// Find by transcript ID
transcriptSchema.statics.findByTranscriptId = async function(transcriptId: string): Promise<ITranscript | null> {
    return await this.findOne({ transcriptId })
}

// Find by ticket ID (latest)
transcriptSchema.statics.findByTicketId = async function(ticketId: string): Promise<ITranscript | null> {
    return await this.findOne({ ticketId }).sort({ generatedAt: -1 })
}

let Transcript: ITranscriptModel

try {
    Transcript = mongoose.model<ITranscript, ITranscriptModel>('Transcript')
} catch {
    Transcript = mongoose.model<ITranscript, ITranscriptModel>('Transcript', transcriptSchema)
}

export default Transcript
