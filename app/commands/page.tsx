"use client"

import { useState, useEffect } from "react"
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
  Terminal,
  Sparkles
} from "lucide-react"

// Mock commands data - replace with your actual import
// Replace the mock data with:
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
const DEFAULT_PREFIX = '!!'

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
    <div className="min-h-screen bg-black relative">
      {/* Fixed Video Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          style={{
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <source src="/sky.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-violet-400 to-white bg-clip-text text-transparent">
                Commands
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Discover the full power of <span className="text-violet-400 font-semibold">Demon Bot</span> with our comprehensive command library
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-slate-400">
              <div className="flex items-center bg-slate-900/60 px-6 py-3 rounded-full border border-slate-700/50 backdrop-blur-sm">
                <Slash className="w-4 h-4 mr-2 text-blue-400" />
                <span>Slash Commands</span>
              </div>
              <div className="flex items-center bg-slate-900/60 px-6 py-3 rounded-full border border-slate-700/50 backdrop-blur-sm">
                <Hash className="w-4 h-4 mr-2 text-orange-400" />
                <span>Prefix Commands</span>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-12 space-y-6">
            <div className="relative max-w-2xl mx-auto">
              <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-1 hover:border-violet-400/30 transition-all duration-300">
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-300 h-6 w-6 z-20 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search commands, aliases, or descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-6 h-16 bg-transparent border-0 focus:ring-2 focus:ring-violet-400/20 focus:outline-none text-white placeholder-slate-400 text-lg font-medium transition-all duration-300 rounded-2xl"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-8 py-4 font-semibold transition-all duration-300 ${
                  selectedCategory === null 
                    ? "bg-gradient-to-r from-violet-400 to-purple-400 text-black shadow-lg" 
                    : "border border-slate-600 hover:border-violet-400 hover:text-violet-400 bg-slate-800/60 backdrop-blur-sm text-white"
                }`}
              >
                All Commands
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-8 py-4 font-semibold transition-all duration-300 capitalize ${
                    selectedCategory === category 
                      ? "bg-gradient-to-r from-violet-400 to-purple-400 text-black shadow-lg" 
                      : "border border-slate-600 hover:border-violet-400 hover:text-violet-400 bg-slate-800/60 backdrop-blur-sm text-white"
                  }`}
                >
                  {category.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Commands Grid */}
          <div className="space-y-10">
            {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category} className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <Terminal className="w-8 h-8 text-violet-400" />
                    <h2 className="text-3xl font-bold text-white capitalize">
                      {category.replace(/_/g, ' ')}
                    </h2>
                    <span className="text-base text-gray-400 bg-slate-800/50 px-3 py-1 rounded-full">
                      {categoryCommands.length} commands
                    </span>
                  </div>
                  
                  {supportsSlashCommands(category) && (
                    <div className="flex gap-3">
                      <span className="flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-sm">
                        <Slash className="h-4 w-4" />
                        Slash
                      </span>
                      <span className="flex items-center gap-2 border border-orange-500/30 text-orange-300 bg-orange-500/10 px-3 py-1 rounded-full text-sm">
                        <Hash className="h-4 w-4" />
                        Prefix
                      </span>
                    </div>
                  )}
                  {!supportsSlashCommands(category) && (
                    <span className="flex items-center gap-2 border border-orange-500/30 text-orange-300 bg-orange-500/10 px-3 py-1 rounded-full text-sm">
                      <Hash className="h-4 w-4" />
                      Prefix Only
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryCommands.map((command) => (
                    <div 
                      key={command.name}
                      className="group relative overflow-hidden bg-slate-900/60 border border-slate-700/50 hover:border-violet-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-400/10 backdrop-blur-sm rounded-lg"
                    >
                      <div 
                        className="cursor-pointer hover:bg-slate-800 hover:bg-opacity-40 transition-colors duration-200 p-6"
                        onClick={() => toggleCommandExpansion(command.name)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-violet-400" />
                            <h3 className="text-violet-400 font-mono text-xl group-hover:text-white transition-colors">
                              {command.name}
                            </h3>
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
                      </div>
                      
                      {expandedCommands.has(command.name) && (
                        <div className="pt-0 space-y-4 border-t border-gray-700/50 p-6">
                          <div className="grid grid-cols-1 gap-4 text-sm">
                            {/* Usage Section */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                Usage
                              </h4>
                              <div className="bg-slate-800/60 rounded-lg p-4 font-mono text-base border border-slate-700/50">
                                <span className="text-violet-400">
                                  {formatUsage(command.usage, command.name, command.category)}
                                </span>
                              </div>
                            </div>

                            {/* Copy Buttons */}
                            <div className="flex gap-3">
                              {supportsSlashCommands(command.category) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyCommand(command.name, true);
                                  }}
                                  className="flex-1 border border-blue-500 border-opacity-30 text-blue-300 hover:bg-blue-500 hover:bg-opacity-20 hover:border-blue-400 transition-all duration-200 px-3 py-2 rounded-md text-sm flex items-center justify-center gap-2"
                                >
                                  {copiedCommand === `/${command.name}` ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Slash className="h-4 w-4" />
                                  )}
                                  Copy Slash
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyCommand(command.name, false);
                                }}
                                className="flex-1 border border-gray-600 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 px-3 py-2 rounded-md text-sm flex items-center justify-center gap-2 text-white"
                              >
                                {copiedCommand === `${DEFAULT_PREFIX}${command.name}` ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                                Copy Prefix
                              </button>
                            </div>

                            {command.aliases && command.aliases.length > 0 && (
                              <div>
                                <span className="text-gray-400 font-medium">Aliases:</span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {command.aliases.map((alias) => (
                                    <span key={alias} className="text-xs bg-gray-700/60 text-gray-300 hover:bg-gray-700 transition-colors px-2 py-1 rounded-md">
                                      {alias}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {command.cooldown > 0 && (
                              <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-orange-400" />
                                <span className="text-gray-400">Cooldown:</span>
                                <span className="border border-orange-500/30 text-orange-300 bg-orange-500/10 px-2 py-1 rounded-md text-xs">
                                  {command.cooldown}s
                                </span>
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
                                    <span key={perm} className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors px-2 py-1 rounded-md">
                                      {perm.replace(/_/g, ' ')}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-4 pt-3 border-t border-gray-700/50">
                              {command.guildOnly && (
                                <span className="text-xs border border-purple-500/30 text-purple-300 bg-purple-500/10 px-2 py-1 rounded-md">
                                  Server Only
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                Category: {command.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(groupedCommands).length === 0 && (
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <Terminal className="w-20 h-20 text-gray-600 mx-auto" />
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