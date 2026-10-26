import React from 'react';

/**
 * Renders a rounded pill tag from explicit text and color props (no Supabase fetch).
 * When `color` is a 7-character hex string, the background is set to the color at 12% opacity
 * while the text uses the full color. Shows a loading-style skeleton when `text` is omitted.
 *
 * @param {string} [text] - Display text; omitting renders a skeleton placeholder
 * @param {string | null} [color] - Hex color string (e.g. `"#e53935"`) for background tint and text
 * @param {React.ReactNode} [children] - Optional content appended after the tag text (e.g. a remove icon)
 *
 * @example
 * ```tsx
 * <TagFull text="High Priority" color="#e53935" />
 * <TagFull text="VIP" color="#1565c0"><X className="h-3 w-3" /></TagFull>
 * ```
 */

interface TagFullProps {
    text?: string;
    color?: string | null;
    children?: React.ReactNode;
}

export function TagFull({ text, color, children }: TagFullProps) {
    // If no text provided, show a small skeleton placeholder
    if (!text) {
        return (
            <div className="px-3 py-1 rounded-full text-sm font-medium shadow bg-gray-200 text-gray-400 animate-pulse">
                ...
            </div>
        );
    }

    // Compute a translucent background when a solid hex color is provided (#rrggbb)
    const bg = color && color.length === 7 ? color + '20' : color || undefined;
    const style: React.CSSProperties = bg ? { backgroundColor: bg, color: color || undefined } : {};

    return (
        <div
            className="flex flex-row px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow items-center"
            style={style}
        >
            {text} {children}
        </div>
    );
};




