import React from "react";
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, format } from "date-fns";


interface CalendarDayProps {
    date: Date;
    children?: React.ReactNode;
}

/**
 * Renders a 7-column monthly grid, offsetting the first cell to the correct weekday.
 * Children are distributed one-per-day in order; days with no child render as empty cells.
 * Adapts cell height between mobile and larger screens via `useScreenSizeCtx`.
 *
 * @param {Date} date - Any date within the month to display
 * @param {React.ReactNode} [children] - One element per day; index 0 maps to the 1st of the month
 *
 * @example
 * ```tsx
 * <CalendarDay date={new Date(2025, 6, 1)}>
 *   {dayComponents}
 * </CalendarDay>
 * ```
 */

export function CalendarDay({ date, children }: CalendarDayProps) {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startOffset = getDay(monthStart); // 0 (Sun) - 6 (Sat)
    const totalCells = Math.ceil((startOffset + daysInMonth.length) / 7) * 7;
    const childArray = React.Children.toArray(children);

    const cells = [];
    for (let i = 0; i < totalCells; i++) {
        if (i < startOffset || i - startOffset >= daysInMonth.length) {
            // Empty cell for offset or after last day
            cells.push(
                <div key={i} className="bg-background p-2 h-16" />
            );
        } else {
            const day = daysInMonth[i - startOffset];
            if (!day) {
                continue;
            }
            cells.push(
                <div
                    key={i}
                    className="bg-surface text-text p-2 h-12 sm:h-16 text-left flex flex-row rounded-md shadow-md justify-start hover:bg-hover-1"
                >
                    <div className="font-medium text-sm flex flex-row justify-between">
                        {format(day, 'd')}
                    </div>
                    <div className="w-full">
                        {childArray[i - startOffset]}
                    </div>

                </div>
            );
        }
    }

    return (
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {cells}
        </div>
    );
};