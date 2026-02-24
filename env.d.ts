/// <reference types="next" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_DEFAULT_PREFIX: string
    readonly DISCORD_CLIENT_ID: string
    readonly DISCORD_CLIENT_SECRET: string
    readonly NEXTAUTH_SECRET: string
    readonly NEXTAUTH_URL: string
    readonly MONGODB_URI: string
  }
}
