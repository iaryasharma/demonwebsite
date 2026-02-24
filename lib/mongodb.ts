import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable in .env.local")
}

interface MongooseCache {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
    uri: string | null
}

declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null, uri: null }

if (!global.mongooseCache) {
    global.mongooseCache = cached
}

export async function connectToDatabase() {
    // If URI changed (env reload), reset the cached connection
    if (cached.uri && cached.uri !== MONGODB_URI) {
        if (cached.conn) {
            await mongoose.disconnect()
        }
        cached.conn = null
        cached.promise = null
        cached.uri = null
    }

    if (cached.conn) return cached.conn

    if (!cached.promise) {
        cached.uri = MONGODB_URI
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        })
    }

    cached.conn = await cached.promise
    return cached.conn
}
