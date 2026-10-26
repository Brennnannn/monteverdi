import { Home } from "lucide-react";

export interface PathItem<TMeta = unknown> {
    name: string;
    children?: PathItem<TMeta>[];
    parent?: PathItem<TMeta>;
    meta?: TMeta;
}

interface ExplorerProps<TMeta = unknown> {
    path: PathItem<TMeta>;
    setPath: (item: PathItem<TMeta>) => void;
}

/**
 * Walks the `parent` chain of `item` and returns an ordered array from root to `item`.
 *
 * @param {PathItem<TMeta>} item - The current leaf node in the path tree
 *
 * @example
 * ```ts
 * tracePath(deepItem); // [root, child, deepItem]
 * ```
 */
export function tracePath<TMeta>(item: PathItem<TMeta>): PathItem<TMeta>[] {
    if (item.parent) {
        return [...tracePath(item.parent), item]
    } else {
        return [item]
    }
}

/**
 * Renders a breadcrumb path bar for tree navigation.
 * Displays a home icon for the root node and clickable path segments for each ancestor.
 * Shows "No path selected" when the current node is the root (no parent).
 *
 * @param {PathItem<TMeta>} path - The currently active node in the path tree
 * @param {(item: PathItem<TMeta>) => void} setPath - Called when the user clicks a breadcrumb segment
 *
 * @example
 * ```tsx
 * <ExplorerHeader path={currentNode} setPath={setCurrentNode} />
 * ```
 */
export function ExplorerHeader<TMeta = unknown>({
    path,
    setPath
}: ExplorerProps<TMeta>) {

    return (
        <div className="flex gap-2">
            <div className="flex-1">
                <div className="relative">
                    <div className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary focus:border-transparent min-h-[42px] flex items-center flex-wrap gap-1">
                        {!path.parent ? (
                            <span className="text-text-muted text-sm">No path selected</span>
                        ) : (
                            tracePath(path).map((item, index) => (
                                index == 0 ? (
                                    <Home
                                        key={index}
                                        onClick={() => setPath(item)}
                                        className='absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted h-5 w-5 cursor-pointer hover:text-primary transition-colors'
                                    />
                                ) : (
                                    <div key={index} className="flex items-center">
                                        <span className="text-text-muted mx-1">/</span>
                                        <button
                                            onClick={() => setPath(item)}
                                            className="px-2 py-1 rounded hover:bg-hover-1 transition-colors cursor-pointer text-sm font-medium"
                                        >
                                            {item.name}
                                        </button>
                                    </div>
                                )
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}