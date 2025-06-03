"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Search, 
  Copy, 
  Check, 
  Hash, 
  Slash, 
  ChevronDown, 
  ChevronRight,
  Clock,
  Shield,
  Zap,
  Command as CommandIcon,
  Sparkles
} from "lucide-react"
import commandsData from "@/json/commands_list.json"

interface Command {
  file: string
  name: string
  description: string
  usage: string
  category: string
  cooldown: number
  userPermissions: string[]
  botPermissions: string[]
  aliases: string[]
  guildOnly: boolean
}

// Categories that support both slash and prefix commands
const SLASH_CATEGORIES = ['announcement', 'information', 'settings', 'moderator', 'support', 'voicemod']

// Get default prefix from environment or fallback
const DEFAULT_PREFIX = process.env.NEXT_PUBLIC_DEFAULT_PREFIX || '!!'

export default function CommandsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)
  const [expandedCommands, setExpandedCommands] = useState<Set<string>>(new Set())

  // Prevent image downloads on the entire page
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    };
    
    const handleDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    };

    const handleSelectStart = (e: Event) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  // Type the commands data
  const commands: Command[] = commandsData as Command[]

  // Get unique categories from the commands data
  const categories = Array.from(new Set(commands.map(cmd => cmd.category))).sort()

  // Toggle command expansion
  const toggleCommandExpansion = (commandName: string) => {
    const newExpanded = new Set(expandedCommands)
    if (newExpanded.has(commandName)) {
      newExpanded.delete(commandName)
    } else {
      newExpanded.add(commandName)
    }
    setExpandedCommands(newExpanded)
  }

  // Filter commands based on search and category
  const filteredCommands = commands.filter(cmd => {
    const matchesSearch = !searchTerm || 
      cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = !selectedCategory || cmd.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Group filtered commands by category
  const groupedCommands = categories.reduce((acc, category) => {
    const categoryCommands = filteredCommands.filter(cmd => cmd.category === category)
    if (categoryCommands.length > 0) {
      acc[category] = categoryCommands
    }
    return acc
  }, {} as Record<string, Command[]>)

  // Copy command to clipboard
  const copyCommand = async (commandName: string, isSlashCommand: boolean) => {
    const commandText = isSlashCommand ? `/${commandName}` : `${DEFAULT_PREFIX}${commandName}`
    
    try {
      await navigator.clipboard.writeText(commandText)
      setCopiedCommand(commandText)
      setTimeout(() => setCopiedCommand(null), 2000)
    } catch (err) {
      console.error('Failed to copy command:', err)
    }
  }

  // Check if a category supports slash commands
  const supportsSlashCommands = (category: string) => SLASH_CATEGORIES.includes(category)

  // Format command usage
  const formatUsage = (usage: string, commandName: string, category: string) => {
    if (supportsSlashCommands(category)) {
      return usage.startsWith('/') ? usage : `/${usage}`
    }
    return usage.startsWith(DEFAULT_PREFIX) ? usage : `${DEFAULT_PREFIX}${usage}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00FF85]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>
      
      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Sparkles className="w-12 h-12 text-[#00FF85] mr-4 animate-spin" style={{animationDuration: '4s'}} />
                <div className="absolute inset-0 w-12 h-12 bg-[#00FF85]/30 rounded-full blur-lg mr-4 animate-pulse" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-[#00FF85] to-white bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                Commands
              </h1>
              <div className="relative">
                <Sparkles className="w-12 h-12 text-[#00FF85] ml-4 animate-spin" style={{animationDelay: '2s', animationDuration: '4s'}} />
                <div className="absolute inset-0 w-12 h-12 bg-[#00FF85]/30 rounded-full blur-lg ml-4 animate-pulse" style={{animationDelay: '1s'}} />
              </div>
            </div>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Discover the full power of <span className="text-[#00FF85] font-semibold">Demon Bot</span> with our comprehensive command library
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-slate-400">
              <div className="flex items-center bg-slate-800/60 px-6 py-3 rounded-full border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/80 transition-all duration-300">
                <Slash className="w-4 h-4 mr-2 text-blue-400" />
                <span>Slash Commands</span>
              </div>
              <div className="flex items-center bg-slate-800/60 px-6 py-3 rounded-full border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/80 transition-all duration-300">
                <Hash className="w-4 h-4 mr-2 text-orange-400" />
                <span>Prefix Commands</span>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-12 space-y-6">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00FF85]/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl animate-pulse" />
              <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-1 hover:border-[#00FF85]/30 transition-all duration-300">
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-300 h-6 w-6 z-20 pointer-events-none" />
                  <Input
                    placeholder="Search commands, aliases, or descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-16 pr-6 h-16 bg-transparent border-0 focus:ring-2 focus:ring-[#00FF85]/20 focus:outline-none text-white placeholder-slate-400 text-lg font-medium transition-all duration-300"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap justify-center">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-8 py-4 font-semibold transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === null 
                    ? "bg-gradient-to-r from-[#00FF85] to-emerald-400 text-black hover:from-[#00FF85]/90 hover:to-emerald-400/90 shadow-xl shadow-[#00FF85]/30" 
                    : "border-slate-600 hover:border-[#00FF85] hover:text-[#00FF85] hover:shadow-lg hover:shadow-[#00FF85]/10 bg-slate-800/60 backdrop-blur-sm"
                }`}
              >
                All Commands
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-8 py-4 font-semibold transition-all duration-300 transform hover:scale-105 capitalize ${
                    selectedCategory === category 
                      ? "bg-gradient-to-r from-[#00FF85] to-emerald-400 text-black hover:from-[#00FF85]/90 hover:to-emerald-400/90 shadow-xl shadow-[#00FF85]/30" 
                      : "border-slate-600 hover:border-[#00FF85] hover:text-[#00FF85] hover:shadow-lg hover:shadow-[#00FF85]/10 bg-slate-800/60 backdrop-blur-sm"
                  }`}
                >
                  {category.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Commands Grid */}
          <div className="space-y-10">
            {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category} className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <CommandIcon className="w-8 h-8 text-[#00FF85] z-10 relative" />
                      <div className="absolute inset-0 w-8 h-8 bg-[#00FF85]/20 rounded-full blur-md animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-bold text-white capitalize">
                      {category.replace(/_/g, ' ')}
                    </h2>
                    <span className="text-base text-gray-400 bg-slate-800/50 px-3 py-1 rounded-full">
                      {categoryCommands.length} commands
                    </span>
                  </div>
                  
                  {supportsSlashCommands(category) && (
                    <div className="flex gap-3">
                      <Badge variant="secondary" className="flex items-center gap-2 bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
                        <Slash className="h-4 w-4" />
                        Slash
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-2 border-orange-500/30 text-orange-300 bg-orange-500/10 px-3 py-1">
                        <Hash className="h-4 w-4" />
                        Prefix
                      </Badge>
                    </div>
                  )}
                  {!supportsSlashCommands(category) && (
                    <Badge variant="outline" className="flex items-center gap-2 border-orange-500/30 text-orange-300 bg-orange-500/10 px-3 py-1">
                      <Hash className="h-4 w-4" />
                      Prefix Only
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryCommands.map((command) => (
                    <Collapsible 
                      key={command.name}
                      open={expandedCommands.has(command.name)}
                      onOpenChange={() => toggleCommandExpansion(command.name)}
                    >
                      <Card className="group relative overflow-hidden bg-slate-900/60 border-slate-700/50 hover:border-[#00FF85]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#00FF85]/20 backdrop-blur-sm hover:bg-slate-900/80">
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-slate-800/40 transition-colors duration-200 p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-[#00FF85]" />
                                <CardTitle className="text-[#00FF85] font-mono text-xl group-hover:text-white transition-colors">
                                  {command.name}
                                </CardTitle>
                              </div>
                              <div className="flex items-center gap-2">
                                {supportsSlashCommands(command.category) && (
                                  <Slash className="w-4 h-4 text-blue-400" />
                                )}
                                <Hash className="w-4 h-4 text-gray-400" />
                                {expandedCommands.has(command.name) ? (
                                  <ChevronDown className="w-5 h-5 text-gray-400 transition-transform" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-gray-400 transition-transform" />
                                )}
                              </div>
                            </div>
                            <p className="text-gray-300 text-left mt-3 leading-relaxed">
                              {command.description}
                            </p>
                          </CardHeader>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <CardContent className="pt-0 space-y-4 border-t border-gray-700/50 p-6">
                            <div className="grid grid-cols-1 gap-4 text-sm">
                              {/* Usage Section */}
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                                  <CommandIcon className="w-4 h-4" />
                                  Usage
                                </h4>
                                <div className="bg-slate-800/60 rounded-lg p-4 font-mono text-base border border-slate-700/50">
                                  <span className="text-[#00FF85]">
                                    {formatUsage(command.usage, command.name, command.category)}
                                  </span>
                                </div>
                              </div>

                              {/* Copy Buttons */}
                              <div className="flex gap-3">
                                {supportsSlashCommands(command.category) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyCommand(command.name, true);
                                    }}
                                    className="flex-1 border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-200"
                                  >
                                    {copiedCommand === `/${command.name}` ? (
                                      <Check className="h-4 w-4 mr-2" />
                                    ) : (
                                      <Slash className="h-4 w-4 mr-2" />
                                    )}
                                    Copy Slash
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyCommand(command.name, false);
                                  }}
                                  className="flex-1 border-gray-600 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200"
                                >
                                  {copiedCommand === `${DEFAULT_PREFIX}${command.name}` ? (
                                    <Check className="h-4 w-4 mr-2" />
                                  ) : (
                                    <Copy className="h-4 w-4 mr-2" />
                                  )}
                                  Copy Prefix
                                </Button>
                              </div>

                              {command.aliases && command.aliases.length > 0 && (
                                <div>
                                  <span className="text-gray-400 font-medium">Aliases:</span>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {command.aliases.map((alias) => (
                                      <Badge key={alias} variant="secondary" className="text-xs bg-gray-700/60 text-gray-300 hover:bg-gray-700 transition-colors">
                                        {alias}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {command.cooldown > 0 && (
                                <div className="flex items-center gap-3">
                                  <Clock className="w-5 h-5 text-orange-400" />
                                  <span className="text-gray-400">Cooldown:</span>
                                  <Badge variant="outline" className="border-orange-500/30 text-orange-300 bg-orange-500/10">
                                    {command.cooldown}s
                                  </Badge>
                                </div>
                              )}

                              {command.userPermissions && command.userPermissions.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-3 mb-3">
                                    <Shield className="w-5 h-5 text-red-400" />
                                    <span className="text-gray-400 font-medium">Required Permissions:</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {command.userPermissions.map((perm) => (
                                      <Badge key={perm} variant="destructive" className="text-xs bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30 transition-colors">
                                        {perm.replace(/_/g, ' ')}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-4 pt-3 border-t border-gray-700/50">
                                {command.guildOnly && (
                                  <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300 bg-purple-500/10">
                                    Server Only
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  Category: {command.category}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(groupedCommands).length === 0 && (
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <CommandIcon className="w-20 h-20 text-gray-600 mx-auto" />
                <div className="absolute inset-0 w-20 h-20 bg-gray-600/10 rounded-full blur-lg mx-auto animate-pulse" />
              </div>
              <p className="text-gray-400 text-xl mb-2">No commands found matching your search.</p>
              <p className="text-gray-500 text-base">Try adjusting your search terms or category filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
