type NavItemBase = {
    label: string;
    icon?: React.ReactNode;
};

type NavItemLink = NavItemBase & { link: string; type: "link" };
type NavItemAction = NavItemBase & { onClick: () => void; type: "action" };
type NavItemNode = NavItemBase & { children: NavItemData[]; defaultOpen?: boolean; type: "node" };

/**
 * Data shape for a navigation entry. `link` navigates, `action` fires a callback, `node`
 * holds nested `children` — each consumer (`InnerNavItem`, `OuterNavItem`, ...) decides how
 * to render a `node` itself (nested list, dropdown, etc.), since that varies by nav shell.
 * Build items with `navLink`/`navAction`/`navNode` rather than object literals.
 */
export type NavItemData = NavItemLink | NavItemAction | NavItemNode;

/**
 * @example
 * navLink({ link: "/projects", label: "Projects", icon: <Users /> })
 */
export function navLink(item: Omit<NavItemLink, "type">): NavItemData {
    return { ...item, type: "link" };
}

/**
 * @example
 * navAction({ onClick: () => setOpen(false), label: "Sign Out", icon: <LogOut /> })
 */
export function navAction(item: Omit<NavItemAction, "type">): NavItemData {
    return { ...item, type: "action" };
}

/**
 * @param {boolean} [item.defaultOpen] - Whether the node's children start expanded — set this
 * when the caller already knows the node is active (e.g. one of its children matches the
 * current route), since consumers seed their expand state from it rather than guessing.
 * @example
 * navNode({ label: "Data", children: [navLink({ link: "/admin/data/tags", label: "Tags" })] })
 */
export function navNode(item: Omit<NavItemNode, "type">): NavItemData {
    return { ...item, type: "node" };
}
