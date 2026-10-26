import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import type { NavItemData } from "@ui";
import { ClefLogo } from "../clef-logo";
import { OuterNavItem } from "./outer-nav-item";

type OuterNavProps = {
    navItems: NavItemData[][];
    /** Rendered at the far right of the bar (e.g. the settings button). */
    right?: ReactNode;
    children?: ReactNode;
    className?: string;
};

/**
 * Monteverdi's top-level nav bar, ported from Bear's `OuterNav`: clef mark + wordmark on the
 * left, segmented nav items (a divider between each group), `children`, then `right`. Below
 * `SIZE.SM` items render icon-only (`OuterNavItem` handles that).
 *
 * @param {NavItemData[][]} navItems - Segments of nav items; a divider renders between groups
 * @param {React.ReactNode} [right] - Content pinned to the right edge
 * @param {React.ReactNode} [children] - Rendered between the nav items and `right`
 * @param {string} [className] - Additional classes merged onto the header element
 *
 * @example
 * ```tsx
 * <OuterNav navItems={[mainNav]} right={<SettingsButton />} />
 * ```
 */
export function OuterNav({ navItems, right, children, className }: OuterNavProps) {
    return (
        <header className={twMerge("sticky top-0 w-full h-16 sm:h-20 z-20 bg-background", className)}>
            <div className="flex items-stretch h-full w-full px-4 gap-4">
                <Link to="/" className="shrink-0 flex items-center gap-2 text-text hover:text-primary transition-colors">
                    <ClefLogo className="h-6 sm:h-8" />
                    <span className="text-xl sm:text-2xl font-semibold tracking-tight">Monteverdi</span>
                </Link>
                <div className="flex-1 flex h-full items-stretch justify-between gap-4">
                    <nav className="flex items-stretch divide-x divide-trim">
                        {navItems.map((segment, idx) => (
                            <div key={idx} className="flex flex-row">
                                {segment.map((item) => (
                                    <OuterNavItem key={item.type === "link" ? item.link : item.label} item={item} variant="top" />
                                ))}
                            </div>
                        ))}
                    </nav>
                    {children && <div className="flex items-center">{children}</div>}
                    {right && <div className="flex items-center">{right}</div>}
                </div>
            </div>
        </header>
    );
}
