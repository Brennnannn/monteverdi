import { cloneElement, isValidElement, ReactElement, useState } from "react";
import { Link } from "react-router-dom";
import { Card, ForegroundFocus, NavItemData, useScreenSizeCtx, SIZE } from "@ui";

type OuterNavItemProps = {
    item: NavItemData;
    variant: 'top' | 'bottom';
};

/**
 * Renders a single nav entry for `OuterNav` — matches `apps/app`'s historical `NavItem`
 * styling exactly, since that's what it used for both its desktop top bar and mobile
 * footer, identically. `variant` is kept on the type for future differentiation but
 * currently renders the same either way. `node` items open a dropdown of their `children`
 * instead of navigating — the icon slot renders the caller-supplied icon as normal (unlike
 * `InnerNavItem`, which overrides it with an expand chevron for its inline sub-list).
 *
 * @param {NavItemData} item - The nav item to render
 * @param {'top' | 'bottom'} variant - Which of `OuterNav`'s two layouts this item sits in
 *
 * @example
 * ```tsx
 * <OuterNavItem item={navLink({ link: "/account", label: "My Account", icon: <CircleUser /> })} variant="top" />
 * ```
 */
export function OuterNavItem({ item }: OuterNavItemProps) {
    const { size } = useScreenSizeCtx();
    const [isOpen, setIsOpen] = useState(false);
    const className = "flex flex-col sm:flex-row items-center px-3 my-2 rounded-md text-xs sm:text-sm justify-center font-medium text-text hover:bg-hover-1 transition-colors";

    const content = (
        <>
            <div className="h-5 sm:h-4 w-5 sm:w-4">
                {isValidElement(item.icon)
                    ? cloneElement(item.icon as ReactElement<{ className?: string }>, { className: "h-5 w-5" })
                    : item.icon}
            </div>
            {size > SIZE.SM && <div className="sm:ml-2">{item.label}</div>}
        </>
    );

    if (item.type === "link")
        return <Link to={item.link} className={className} title={`Navigate to ${item.label}`}>{content}</Link>;

    if (item.type === "action")
        return <button type="button" onClick={item.onClick} className={className} title={item.label}>{content}</button>;

    return (
        <div className="relative">
            {isOpen && <ForegroundFocus onClick={() => setIsOpen(false)} />}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={className}
                title={item.label}
            >
                {content}
            </button>
            {isOpen && (
                <Card className="absolute z-50 w-56 divide-y divide-trim left-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2">
                    {item.children.map((child) => (
                        <OuterNavItem
                            key={child.type === "link" ? child.link : child.label}
                            item={child}
                            variant="top"
                        />
                    ))}
                </Card>
            )}
        </div>
    );
}
