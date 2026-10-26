import { format, addMonths, isBefore, isAfter, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Card } from '@ui';
import { useScreenSizeCtx } from "../context/screen-context";
import { SIZE } from "../constants";

interface CalendarMonthProps {
    /** The currently selected month (any date within the month). */
    date: Date;
    /** Callback when the month changes. Receives the new month (first day of month). */
    onMonthChange?: (date: Date) => void;
    /** Earliest selectable month (any date within the month). Optional. */
    minDate?: Date;
    /** Latest selectable month (any date within the month). Optional. Defaults to current month. */
    maxDate?: Date;
}

/**
 * Renders a month navigator with previous/next chevron buttons and the current month label.
 * Prev/next buttons are disabled when the adjacent month falls outside `minDate`/`maxDate`.
 * `onMonthChange` always receives the first day of the new month.
 *
 * @param {Date} date - The currently displayed month (any date within it)
 * @param {(date: Date) => void} [onMonthChange] - Called with the first day of the new month when the user navigates
 * @param {Date} [minDate] - Earliest navigable month (inclusive; any date within the month)
 * @param {Date} [maxDate] - Latest navigable month (inclusive; any date within the month)
 *
 * @example
 * ```tsx
 * <CalendarMonth
 *   date={currentMonth}
 *   onMonthChange={setCurrentMonth}
 *   minDate={new Date(2020, 0, 1)}
 * />
 * ```
 */

export function CalendarMonth({
    date,
    onMonthChange,
    minDate,
    maxDate,
}: CalendarMonthProps) {
    const { size } = useScreenSizeCtx();
    const currentMonth = startOfMonth(date);
    const effectiveMax = maxDate ? startOfMonth(maxDate) : undefined;
    const effectiveMin = minDate ? startOfMonth(minDate) : undefined;

    const prevMonth = addMonths(currentMonth, -1);
    const nextMonth = addMonths(currentMonth, 1);

    const canGoPrev = !effectiveMin || !isBefore(prevMonth, effectiveMin);
    const canGoNext = !effectiveMax || !isAfter(nextMonth, effectiveMax);

    const handlePreviousMonth = () => {
        if (canGoPrev && onMonthChange) {
            onMonthChange(prevMonth);
        }
    };

    const handleNextMonth = () => {
        if (canGoNext && onMonthChange) {
            onMonthChange(nextMonth);
        }
    };

    return (
        <Card className={`p-2 ${size < SIZE.SM ? 'w-full justify-between' : ''} flex items-center space-x-2`}>
            <Button
                onClick={handlePreviousMonth}
                disabled={!canGoPrev}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>


            <span className="text-lg text-text font-medium">
                {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
                onClick={handleNextMonth}
                disabled={!canGoNext}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </Card>


    );
};