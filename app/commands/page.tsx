import { getCommandsCatalog } from "@/lib/commands-data"
import { CommandsExplorer } from "@/components/commands/commands-explorer"

export default function CommandsPage() {
  const { commands, categories, summary } = getCommandsCatalog()

  return (
    <CommandsExplorer
      catalog={{
        commands,
        categories,
        summary,
      }}
    />
  )
}
