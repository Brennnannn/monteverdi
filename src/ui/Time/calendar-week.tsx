import React from "react";

interface CalendarWeekProps {
    children?: React.ReactNode;
}

/**
 * Renders a 7-column weekly header row (Sun–Sat) with one child slot per day.
 * Only the first 7 children are used; additional children are ignored.
 *
 * @param {React.ReactNode} [children] - Up to 7 elements, one per day column (Sun → Sat)
 *
 * @example
 * ```tsx
 * <CalendarWeek>
 *   {weekDayComponents}
 * </CalendarWeek>
 * ```
 */

export function CalendarWeek({ children }: CalendarWeekProps) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const childArray = React.Children.toArray(children).slice(0, 7);

    return (
        <div className="grid grid-cols-7 min-w-full sm:min-w-[400px]">
            {days.map((day, i) => (
                <div
                    key={day}
                    className={"bg-surface p-2 text-center text-sm text-text font-medium min-h-16 flex flex-col justify-start first:rounded-l-md last:rounded-r-md"}
                >
                    <h1>{day}</h1>
                    {childArray[i]}
                </div>
            ))}
        </div>
    );
};