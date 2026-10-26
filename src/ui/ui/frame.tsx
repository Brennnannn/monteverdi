import { createContext, useContext, useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

interface frameProps extends React.HTMLAttributes<HTMLDivElement> {
    format?:
        | "centered"
        | "full"
        | "cornered-start"
        | "cornered-end"
        | "horizontal"
        | "mobile-nav";
}

//Centered: for content that should take up a "card" in the middle#
//Full: Content that will utilize the entire available space
//Cornered: Content that will using the full screen

export const FrameContext = createContext(false);

/**
 * Layout shell that applies a named format to its children.
 * Nests cleanly — child `Frame` components detect a parent frame via `FrameContext` and remove
 * redundant top padding. The `"horizontal"` format delegates entirely to `HorizontalScroller`.
 *
 * @param {"centered" | "full" | "cornered-start" | "cornered-end" | "horizontal" | "mobile-nav"} [format="full"] - Layout variant:
 *   - `"centered"` — max-width card, horizontally centered with responsive padding
 *   - `"full"` — fills available height, no padding
 *   - `"cornered-start"` — full height, padding applied to top-left corner (standard page layout)
 *   - `"cornered-end"` — full height, padding applied to bottom-right corner
 *   - `"horizontal"` — horizontally scrollable row (renders `HorizontalScroller`)
 *   - `"mobile-nav"` — full-height relative container for mobile drawer layouts
 * @param {string} [className] - Additional Tailwind classes merged onto the inner content div
 * @param {React.ReactNode} [children] - Page or section content
 *
 * @example
 * ```tsx
 * <Frame format="centered">
 *   <MyPageContent />
 * </Frame>
 * ```
 */
export function Frame({ className, format = "full", ...props }: frameProps) {
    const hasParentFrame = useContext(FrameContext);

    const baseStyle = `
        flex flex-col overflow-hidden gap-2
        w-full 
    `;

    let innerStyle: string;
    let outerStyle: string;

    switch (format) {
        case "centered":
            innerStyle = `max-h-full sm:max-w-2xl lg:max-w-4xl ${hasParentFrame ? "!pt-0" : ""} p-2 sm:p-4 lg:p-8`;
            outerStyle = "items-start justify-center";
            break;
        case "full":
            innerStyle = "h-full";
            outerStyle = "flex-1 min-h-0";
            break;
        case "cornered-start":
            innerStyle = `h-full pl-2 pt-2 sm:pl-4 sm:pt-4 lg:pl-8 lg:pt-8 ${hasParentFrame ? "!p-0" : ""}`;
            outerStyle = "flex-1 min-h-0";
            break;
        case "cornered-end":
            innerStyle = `h-full pr-2 pb-2 sm:pr-4 sm:pb-4 lg:pr-8 lg:pb-8`;
            outerStyle = "flex-1 min-h-0";
            break;
        case "horizontal":
            return <HorizontalScroller {...props} />;
        case "mobile-nav":
            innerStyle = "flex flex-col h-full w-full overflow-hidden relative";
            outerStyle = "p-2";
            break;
    }

    return (
        <FrameContext.Provider value={true}>
            <div
                className={`flex items-start w-full overflow-hidden ${outerStyle}`}
            >
                <div className={twMerge(baseStyle, innerStyle, className)}>
                    {props.children}
                </div>
            </div>
        </FrameContext.Provider>
    );
}

/**
 * A horizontally scrollable container that intercepts vertical wheel events and converts
 * them to horizontal scroll, enabling trackpad-style navigation on overflow content.
 * Wraps children in a `Frame format="cornered-end"` for consistent padding.
 *
 * @param {string} [className] - Additional classes merged onto the scrolling element itself (not the outer frame) — e.g. scroll-snap utilities
 * @param {React.ReactNode} [children] - Content that may overflow horizontally
 *
 * @example
 * ```tsx
 * <HorizontalScroller>
 *   <WideTable />
 * </HorizontalScroller>
 * ```
 */
export function HorizontalScroller({
    className,
    children,
    ...props
}: frameProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            // Only intercept if there's actually horizontal overflow
            if (el.scrollWidth <= el.clientWidth) return;

            // Prevent page vertical scroll
            e.preventDefault();

            // Scroll horizontally using the vertical delta
            el.scrollLeft += e.deltaY; // or multiply: e.deltaY * 2 for faster
        };

        el.addEventListener("wheel", handleWheel, { passive: false });
        return () => el.removeEventListener("wheel", handleWheel);
    }, []);

    return (
        <Frame format="cornered-end" className="h-full min-w-0" {...props}>
            <div
                ref={ref}
                className={twMerge(
                    "flex flex-row h-full w-full gap-4 overflow-x-auto overflow-y-hidden min-w-0",
                    className,
                )}
            >
                {children}
            </div>
        </Frame>
    );
}
