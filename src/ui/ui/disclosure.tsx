import { ChevronRight } from "lucide-react";
import { twMerge } from "tailwind-merge";

type DisclosureProps = {
    title: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
};

/**
 * A collapsible section: a clickable title row with a rotating chevron that shows or hides its
 * children. Built on native `<details>`/`<summary>`, so keyboard and screen-reader support come
 * from the browser. Uncontrolled by default (`defaultOpen`); pass `open` and `onOpenChange` when a
 * parent needs to drive it.
 *
 * @example
 * ```tsx
 * <Disclosure title="Endpoints used (12)">
 *   <EndpointList />
 * </Disclosure>
 * ```
 */
export function Disclosure({ title, children, defaultOpen = false, open, onOpenChange, className }: DisclosureProps) {
    return (
        <details
            open={open ?? defaultOpen}
            onToggle={(e) => onOpenChange?.(e.currentTarget.open)}
            className={twMerge("group flex flex-col border border-trim rounded-lg", className)}
        >
            <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none list-none text-sm font-medium text-text hover:bg-hover-1 rounded-lg [&::-webkit-details-marker]:hidden">
                <ChevronRight className="size-4 shrink-0 text-text-muted transition-transform group-open:rotate-90" aria-hidden />
                {title}
            </summary>
            <div className="flex flex-col gap-1 px-3 pb-3 pt-1">
                {children}
            </div>
        </details>
    );
}
