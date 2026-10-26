//TODO: get loading to run through results / add skeleton loading
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { Button } from '@ui';
import { twMerge } from "tailwind-merge";

interface SearchResultsProps {
    headers: string[];
    children: React.ReactNode;
    colSpan?: number;
    range?: [number, number];
    overflow?: boolean;
}


/**
 * Renders a scrollable table with sticky column headers and row children.
 * Shows "No Results Found" when no children are provided.
 * Pass `range` to apply client-side pagination slicing before rendering.
 *
 * @param {string[]} headers - Column header labels (rendered as `<th>` elements)
 * @param {React.ReactNode} children - Row elements, typically `TableRow`
 * @param {number} [colSpan] - Override colspan on the empty-state cell (defaults to headers.length)
 * @param {number[]} [range] - Inclusive `[low, high]` slice indices for client-side pagination
 * @param {boolean} [overflow=true] - Whether the table wrapper scrolls; set false to clip with ellipsis
 *
 * @example
 * ```tsx
 * <TableResults headers={["Name", "DOB"]} range={[0, 9]}>
 *   <TableRow><span>Alice</span><span>1990-01-01</span></TableRow>
 * </TableResults>
 * ```
 */

export function TableResults({ headers, children, colSpan, range, overflow = true }: SearchResultsProps) {
    const hasRows = React.Children.count(children) > 0;

    // Apply client-side pagination if range is provided
    const paginatedChildren = range
        ? React.Children.toArray(children).slice(range[0], range[1] + 1)
        : children;

    return (
        <div className={`shadow rounded-lg w-full flex-1 min-h-0 ${overflow ? 'overflow-auto' : 'text-ellipsis overflow-hidden'}`}>
            <table className="min-w-full w-full divide-y divide-trim">
                <thead className="sticky top-0 bg-background z-10">
                    <tr>
                        {headers.map((title, idx) => (
                            <th
                                key={idx}
                                className={
                                    `px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider `
                                }
                            >
                                {title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className=" divide-y divide-trim bg-surface">
                    {hasRows ? paginatedChildren : (
                        <tr>
                            <td
                                colSpan={colSpan || headers.length}
                                className="px-6 py-4 text-center italic text-text-muted"
                            >
                                No Results Found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};



interface TableRowProps {
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
}


/**
 * Renders a `<tr>` where each direct child is wrapped in a `<td>`.
 * Adds pointer cursor and hover highlight when `onClick` is provided.
 *
 * @param {() => void} [onClick] - Row click handler; enables interactive styling
 * @param {React.ReactNode} children - Cell content elements, one per column
 * @param {string} [className] - Additional Tailwind classes merged onto each `<td>`
 *
 * @example
 * ```tsx
 * <TableRow onClick={() => navigate(`/clients/${id}`)}>
 *   <span>{client.name}</span>
 *   <span>{client.dob}</span>
 * </TableRow>
 * ```
 */

export function TableRow({ onClick, children, className }: TableRowProps) {
    const rowClass = twMerge(
        onClick ? 'cursor-pointer hover:bg-hover-1' : '',
        'transition'
    );

    return (
        <tr
            className={rowClass}
            onClick={onClick}
        >
            {React.Children.map(children, (child, idx) => (
                <td
                    key={idx}
                    className={twMerge('px-6 py-4 text-text', className)}
                >
                    {child}
                </td>
            ))}
        </tr>
    );
};



const pageSize = 10;

interface PaginationProps {
    total: number;
    range: [number, number];
    setRange: (range: [number, number]) => void;
}


/**
 * Renders prev/next pagination controls for a `[low, high]` range state.
 * Hidden when the total fits on a single page (`total <= 10` and on page 1).
 * Page size is fixed at 10.
 *
 * @param {number} total - Total number of items across all pages
 * @param {number[]} range - Current inclusive `[low, high]` indices
 * @param {(range: [number, number]) => void} setRange - Updates the active range
 *
 * @example
 * ```tsx
 * <SearchPagination total={resultsLength} range={range} setRange={setRange} />
 * ```
 */

export function SearchPagination({ total, range, setRange }: PaginationProps) {
    // A new total (a new search) goes back to the first page; range and setRange are read, not watched
    const resetToFirstPage = React.useEffectEvent(() => {
        // For Supabase, range is inclusive: [low, high] = [0, 9] for first 10
        if (total > pageSize && (range[0] !== 0 || range[1] !== pageSize - 1)) {
            setRange([0, pageSize - 1]);
        }
    });

    React.useEffect(() => {
        resetToFirstPage();
    }, [total]);

    // Only hide if total <= 10 AND on the first page
    if (total <= pageSize && range[0] === 0) return null;
    const canPrev = range[0] > 0;
    const canNext = range[1] < total - 1;
    return (
        <div className="flex items-center space-x-2 mt-4">
            <Button
                onClick={() => canPrev && setRange([range[0] - pageSize, range[1] - pageSize])}
                disabled={!canPrev}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg text-text font-medium">
                {range[0] + 1} - {Math.min(range[1] + 1, total)}
            </span>
            <Button
                onClick={() => canNext && setRange([range[0] + pageSize, range[1] + pageSize])}
                disabled={!canNext}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
};