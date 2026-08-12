export interface SlashOptionChoice {
  name: string
  value: string
}

export interface CommandOption {
  name: string
  description: string
  type: string
  required?: boolean
  choices?: SlashOptionChoice[]
  maxLength?: number
  minLength?: number
  minValue?: number
  maxValue?: number
  options?: CommandOption[]
}

export interface SlimSubcommand {
  name: string
  description: string
  options?: CommandOption[]
}

export interface UsageHelp {
  title?: string
  examples?: string[]
  fields?: { name: string; value: string; inline?: boolean }[]
}

export interface SlimCommand {
  name: string
  description: string
  usage: string
  category: string
  type: "slash+prefix" | "prefix-only" | "slash-only"
  cooldown: number
  guildOnly: boolean
  requiredTier: string | null
  aliases: string[]
  userPermissions: string[]
  botPermissions: string[]
  hasSubcommands: boolean
  subcommands: SlimSubcommand[]
  slashOptions: CommandOption[]
  usageHelp: UsageHelp | null
  slashSynced: boolean
}

export interface CommandsCatalog {
  commands: SlimCommand[]
  categories: string[]
  summary: {
    totalCommands: number
    slashAndPrefix: number
    prefixOnly: number
    withSubcommands: number
  }
}
