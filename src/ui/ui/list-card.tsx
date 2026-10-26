import React from "react"
import { Card } from '@ui'

interface ListCardProps {
    head?: React.ReactNode
    children?: React.ReactNode
}

/**
 * Renders a fixed-width scrollable list card with an optional header.
 * Shows an italic "No results" placeholder when no children are provided.
 * Sized at `w-72 h-[32rem]` on sm+ breakpoints; full-width on mobile.
 *
 * @param {React.ReactNode} [head] - Optional header content rendered above the scrollable list
 * @param {React.ReactNode} [children] - List item elements
 *
 * @example
 * ```tsx
 * <ListCard head={<h3 className="p-2 font-bold">Clients</h3>}>
 *   <div className="px-3 py-2">Alice</div>
 *   <div className="px-3 py-2">Bob</div>
 * </ListCard>
 * ```
 */
export function ListCard({ head, children }: ListCardProps) {
    const items = React.Children.toArray(children)

    return (
        <Card className="flex flex-col sm:flex-shrink-0 w-full sm:w-72 sm:h-[32rem] sm:max-h-full overflow-hidden">
            {head && <>{head}</>}
            <div className="flex flex-1 flex-col min-h-0 overflow-y-auto scrollbar-hide gap-1 pt-2">
                {items.length > 0 ?
                    items.map((c) => c)
                    :
                    <span className="self-center text-text-muted text-s italic">No results</span>
                }
            </div>
        </Card>
    )
}