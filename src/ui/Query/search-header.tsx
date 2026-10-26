import { useEffect, useEffectEvent, useState } from "react";
import { Search } from "lucide-react";
import { Button } from '@ui';

type SearchHeaderProps = {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    title: string;
    onSearch: () => Promise<void>;
    minLength?: number;
    disabled?: boolean;
}

/**
 * Renders a search input with a search button. Fires `onSearch` on mount (initial load),
 * on Enter keydown, and on button click. The button is disabled during loading
 * or when the query is shorter than `minLength`.
 *
 * @param {string} searchQuery - Controlled search input value
 * @param {(value: string) => void} setSearchQuery - Updates the controlled search value
 * @param {string} title - Used in the input placeholder as `"Search {title}..."`
 * @param {() => Promise<void>} onSearch - Async search handler; called after the debounce/guard
 * @param {number} [minLength=0] - Minimum query length before search is allowed
 *
 * @example
 * ```tsx
 * <SearchHeader
 *   searchQuery={query}
 *   setSearchQuery={setQuery}
 *   title="Projects"
 *   onSearch={handleSearch}
 *   minLength={2}
 * />
 * ```
 */

export function SearchHeader({ searchQuery, setSearchQuery, title, onSearch, minLength = 0, disabled = false }: SearchHeaderProps) {
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (loading) return;
        setLoading(true);
        try {
            if (searchQuery.length >= minLength) await onSearch();
        } finally {
            setLoading(false);
        }
    };

    // The initial load: search once on mount with whatever the query and handler are then
    const searchOnMount = useEffectEvent(() => { handleSearch(); });

    useEffect(() => {
        searchOnMount();
    }, []);

    return (
        <div className="flex gap-2">
            <div className="flex-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted h-5 w-5" />
                    <input
                        type="text"
                        placeholder={`Search ${title}...`}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary focus:border-transparent bg-background text-text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        minLength={minLength}
                        disabled={loading || disabled}
                    />
                </div>
            </div>
            <Button
                scheme="primary"
                onClick={handleSearch}
                disabled={loading || disabled || searchQuery.length < minLength}
            >
                Search
            </Button>
        </div>
    );
};