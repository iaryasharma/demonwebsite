import type { CommandOption, SlimCommand, SlimSubcommand, UsageHelp } from "@/lib/commands-types"
import rawData from "@/json/commands_list.json"

type RawOption = {
  name: string
  description?: string
  type?: string
  required?: boolean
  choices?: { name: string; value: string }[]
  maxLength?: number
  minLength?: number
  minValue?: number
  maxValue?: number
  options?: RawOption[]
}

type RawCommand = {
  name: string
  description: string
  usage: string
  category: string
  type: SlimCommand["type"]
  cooldown: number
  guildOnly: boolean
  developerOnly?: boolean
  requiredTier?: string | null
  aliases?: string[]
  userPermissions?: string[]
  botPermissions?: string[]
  hasSubcommands?: boolean
  subcommands?: RawOption[]
  slashOptions?: RawOption[]
  usageHelp?: UsageHelp | null
  slashSynced?: boolean
}

function slimOption(opt: RawOption): CommandOption {
  return {
    name: opt.name,
    description: opt.description ?? "",
    type: opt.type ?? "String",
    required: Boolean(opt.required),
    choices: opt.choices?.map(c => ({ name: c.name, value: c.value })),
    maxLength: opt.maxLength,
    minLength: opt.minLength,
    minValue: opt.minValue,
    maxValue: opt.maxValue,
    options: opt.options?.map(slimOption),
  }
}

function slimSubcommand(sub: RawOption): SlimSubcommand {
  return {
    name: sub.name,
    description: sub.description ?? "",
    options: sub.options?.map(slimOption),
  }
}

function slimCommand(cmd: RawCommand): SlimCommand {
  return {
    name: cmd.name,
    description: cmd.description,
    usage: cmd.usage,
    category: cmd.category,
    type: cmd.type,
    cooldown: cmd.cooldown ?? 0,
    guildOnly: Boolean(cmd.guildOnly),
    requiredTier: cmd.requiredTier ?? null,
    aliases: cmd.aliases ?? [],
    userPermissions: cmd.userPermissions ?? [],
    botPermissions: cmd.botPermissions ?? [],
    hasSubcommands: Boolean(cmd.hasSubcommands),
    subcommands: (cmd.subcommands ?? []).map(slimSubcommand),
    slashOptions: (cmd.slashOptions ?? []).map(slimOption),
    usageHelp: cmd.usageHelp ?? null,
    slashSynced: Boolean(cmd.slashSynced),
  }
}

export function getCommandsCatalog() {
  const data = rawData as unknown as {
    commands?: RawCommand[]
    categories?: Record<string, RawCommand[]>
    summary?: { categories?: string[] }
  }

  let list: RawCommand[] = []
  if (Array.isArray(data.commands)) {
    list = data.commands
  } else if (data.categories) {
    list = Object.values(data.categories).flat()
  }

  const commands = list
    .filter(c => !c.developerOnly && c.category !== "developer")
    .map(slimCommand)

  const categoriesMap: Record<string, SlimCommand[]> = {}
  for (const cmd of commands) {
    if (!categoriesMap[cmd.category]) categoriesMap[cmd.category] = []
    categoriesMap[cmd.category].push(cmd)
  }

  const categories =
    data.summary?.categories?.filter(c => c !== "developer" && categoriesMap[c]?.length) ??
    Object.keys(categoriesMap).sort()

  return {
    commands,
    categories,
    categoriesMap,
    summary: {
      totalCommands: commands.length,
      slashAndPrefix: commands.filter(c => c.type === "slash+prefix").length,
      prefixOnly: commands.filter(c => c.type === "prefix-only").length,
      withSubcommands: commands.filter(c => c.hasSubcommands).length,
    },
  }
}
