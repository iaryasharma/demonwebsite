"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faPlus,
    faTrash,
    faToggleOn,
    faToggleOff,
} from "@fortawesome/free-solid-svg-icons"

export interface EmbedField {
    name: string
    value: string
    inline: boolean
}

export interface EmbedData {
    title: string
    description: string
    color: string
    url: string
    author: { name: string; icon_url: string }
    thumbnail: string
    image: string
    footer: { text: string; icon_url: string }
    fields: EmbedField[]
    timestamp: boolean
}

export const defaultEmbed: EmbedData = {
    title: "",
    description: "",
    color: "#8b5cf6",
    url: "",
    author: { name: "", icon_url: "" },
    thumbnail: "",
    image: "",
    footer: { text: "", icon_url: "" },
    fields: [],
    timestamp: false,
}

interface EmbedBuilderProps {
    embed: EmbedData
    onChange: (embed: EmbedData) => void
}

export function EmbedBuilder({ embed, onChange }: EmbedBuilderProps) {
    const update = (partial: Partial<EmbedData>) => onChange({ ...embed, ...partial })

    const addField = () => {
        onChange({
            ...embed,
            fields: [...embed.fields, { name: "", value: "", inline: false }],
        })
    }

    const updateField = (idx: number, field: Partial<EmbedField>) => {
        const fields = [...embed.fields]
        fields[idx] = { ...fields[idx], ...field }
        onChange({ ...embed, fields })
    }

    const removeField = (idx: number) => {
        onChange({ ...embed, fields: embed.fields.filter((_, i) => i !== idx) })
    }

    const inputClass =
        "w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/30 transition-all"
    const labelClass = "block text-xs font-medium text-gray-400 mb-1.5"

    return (
        <div className="space-y-5">
            {/* Author */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-300">Author</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>Name</label>
                        <input
                            className={inputClass}
                            placeholder="Author name"
                            value={embed.author.name}
                            onChange={(e) => update({ author: { ...embed.author, name: e.target.value } })}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Icon URL</label>
                        <input
                            className={inputClass}
                            placeholder="https://..."
                            value={embed.author.icon_url}
                            onChange={(e) => update({ author: { ...embed.author, icon_url: e.target.value } })}
                        />
                    </div>
                </div>
            </div>

            {/* Title & URL */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Title</label>
                    <input
                        className={inputClass}
                        placeholder="Embed title"
                        value={embed.title}
                        onChange={(e) => update({ title: e.target.value })}
                    />
                </div>
                <div>
                    <label className={labelClass}>Title URL</label>
                    <input
                        className={inputClass}
                        placeholder="https://..."
                        value={embed.url}
                        onChange={(e) => update({ url: e.target.value })}
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <label className={labelClass}>Description</label>
                <textarea
                    className={`${inputClass} min-h-[100px] resize-y`}
                    placeholder="Embed description (supports markdown)"
                    value={embed.description}
                    onChange={(e) => update({ description: e.target.value })}
                />
            </div>

            {/* Color */}
            <div className="flex items-center gap-3">
                <label className={`${labelClass} mb-0`}>Color</label>
                <input
                    type="color"
                    value={embed.color}
                    onChange={(e) => update({ color: e.target.value })}
                    className="w-10 h-8 rounded border border-white/10 bg-transparent cursor-pointer"
                />
                <input
                    className={`${inputClass} w-28`}
                    value={embed.color}
                    onChange={(e) => update({ color: e.target.value })}
                    placeholder="#8b5cf6"
                />
            </div>

            {/* Images */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Thumbnail URL</label>
                    <input
                        className={inputClass}
                        placeholder="https://..."
                        value={embed.thumbnail}
                        onChange={(e) => update({ thumbnail: e.target.value })}
                    />
                </div>
                <div>
                    <label className={labelClass}>Image URL</label>
                    <input
                        className={inputClass}
                        placeholder="https://..."
                        value={embed.image}
                        onChange={(e) => update({ image: e.target.value })}
                    />
                </div>
            </div>

            {/* Fields */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-300">
                        Fields <span className="text-gray-500 font-normal">({embed.fields.length}/25)</span>
                    </h4>
                    <button
                        onClick={addField}
                        disabled={embed.fields.length >= 25}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8b5cf6]/10 text-[#a78bfa] text-xs font-medium hover:bg-[#8b5cf6]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                        Add Field
                    </button>
                </div>
                <div className="space-y-3">
                    {embed.fields.map((field, idx) => (
                        <div
                            key={idx}
                            className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] space-y-2"
                        >
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    className={inputClass}
                                    placeholder="Field name"
                                    value={field.name}
                                    onChange={(e) => updateField(idx, { name: e.target.value })}
                                />
                                <input
                                    className={inputClass}
                                    placeholder="Field value"
                                    value={field.value}
                                    onChange={(e) => updateField(idx, { value: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => updateField(idx, { inline: !field.inline })}
                                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                                >
                                    <FontAwesomeIcon
                                        icon={field.inline ? faToggleOn : faToggleOff}
                                        className={`w-4 h-4 ${field.inline ? "text-[#8b5cf6]" : ""}`}
                                    />
                                    Inline
                                </button>
                                <button
                                    onClick={() => removeField(idx)}
                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-300">Footer</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>Text</label>
                        <input
                            className={inputClass}
                            placeholder="Footer text"
                            value={embed.footer.text}
                            onChange={(e) => update({ footer: { ...embed.footer, text: e.target.value } })}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Icon URL</label>
                        <input
                            className={inputClass}
                            placeholder="https://..."
                            value={embed.footer.icon_url}
                            onChange={(e) => update({ footer: { ...embed.footer, icon_url: e.target.value } })}
                        />
                    </div>
                </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => update({ timestamp: !embed.timestamp })}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                    <FontAwesomeIcon
                        icon={embed.timestamp ? faToggleOn : faToggleOff}
                        className={`w-5 h-5 ${embed.timestamp ? "text-[#8b5cf6]" : ""}`}
                    />
                    Include Timestamp
                </button>
            </div>
        </div>
    )
}
