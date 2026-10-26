import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { NavItemData } from '@ui';

export type SequenceItem = Omit<
    //Set as link variant w/ link optional
    Extract<NavItemData, { type: "link" }>,
    "type" | "link"
> & {
    link?: string;
};

type SequenceProps = {
    items: SequenceItem[];
};

/**
 * Renders a horizontal breadcrumb-style sequence of linked items separated by chevron icons.
 * Each item links to `item.link` when provided, or falls back to the label lowercased and trimmed.
 *
 * @param {SequenceItem[]} items - Ordered list of breadcrumb entries
 *
 * @example
 * ```tsx
 * <Sequence
 *   items={[
 *     { label: 'Admin', link: '/admin' },
 *     { label: 'Clients', link: '/admin/clients' },
 *     { label: 'Alice' },
 *   ]}
 * />
 * ```
 */
export function Sequence({ items }: SequenceProps) {
    return (
        <div className="flex flex-row justify-between">
            {items.map((item, index) => (
                <div
                    key={`${item.label}-${index}`}
                    className="flex items-center"
                >
                    <Link to={item.link ?? item.label.toLowerCase().trim()}>
                        <div className="group flex items-center px-2 py-1 text-center transition-all">
                            <span className="group-hover:underline">
                                {item.label}
                            </span>
                        </div>
                    </Link>
                    {index < items.length - 1 && (
                        <ChevronRight className="text-text-muted" />
                    )}
                </div>
            ))}
        </div>
    );
}
