import { cloneElement, lazy, Suspense, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router-dom';
import { Maximize, Minimize } from 'lucide-react';

// Lazy so apps that never render a markdown note don't bundle the editor.
const NoteEditor = lazy(() => import('./note-editor').then((m) => ({ default: m.NoteEditor })));

type NoteFullProps = {
    title: string;
    icons?: React.ReactNode[];
    readonly?: boolean;
    /** Edit and render `content` as markdown instead of plain text. */
    markdown?: boolean;
    /** Fills the parent's height; with `markdown`, also shows the formatting toolbar when editable. */
    expanded?: boolean;
    /** Supplying this adds the maximize/minimize icon; the parent owns `expanded` and the surrounding layout. */
    onToggleExpand?: () => void;
    content: string;
    updateContent: (content: string) => void;
}

/**
 * Renders a note card with a title, textarea for content, and optional header icons.
 * When `readonly` is true the textarea is non-editable and styled with a muted background.
 * Pass `markdown` to swap the textarea for a markdown editor, and `onToggleExpand` to let
 * the note be maximized (Escape minimizes).
 *
 * @example
 * <NoteFull title="Session Notes" icons={[<NoteVisibleIcon key="v" />]} content={notes} updateContent={setNotes} />
 * <NoteFull title="Session Notes" markdown expanded={open} onToggleExpand={() => setOpen(!open)} content={notes} updateContent={setNotes} />
 */
export function NoteFull({
    title,
    icons,
    readonly,
    markdown = false,
    expanded = false,
    onToggleExpand,
    content,
    updateContent,
}: NoteFullProps) {
    useEffect(() => {
        if (!expanded || !onToggleExpand) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            // Escape inside an editor popup (link dialog, menus) only closes that popup.
            if (e.target instanceof Element && e.target.closest('.mdxeditor-popup-container')) return;
            onToggleExpand();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [expanded, onToggleExpand]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateContent(e.target.value);
    };

    const sizing = expanded ? 'flex-1 min-h-0' : 'min-h-[100px]';

    const textarea = (
        <textarea
            value={content}
            onChange={handleContentChange}
            readOnly={readonly}
            placeholder={readonly ? '' : 'Enter your note content here...'}
            className={`w-full ${sizing} p-2 border rounded-md transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${readonly ? 'bg-gray-100 text-text-muted cursor-default' : 'bg-background text-text'
                }`}
        />
    );

    return (
        <div className={`bg-surface p-4 rounded-lg shadow border border-trim w-full ${expanded ? 'flex flex-col h-full min-h-0' : ''}`}>
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg text-text font-medium">{title}</h4>
                {((icons && icons.length > 0) || onToggleExpand) && (
                    <div className="flex gap-2 items-center">
                        {icons}
                        {onToggleExpand && (
                            <NoteIcon
                                icon={expanded ? <Minimize className="text-text" /> : <Maximize className="text-text" />}
                                title={expanded ? 'Minimize' : 'Maximize'}
                                callback={onToggleExpand}
                            />
                        )}
                    </div>
                )}
            </div>
            {markdown ? (
                <Suspense fallback={<div className={`w-full ${sizing} rounded-md bg-hover-1 animate-pulse`} />}>
                    <NoteEditor
                        content={content}
                        updateContent={updateContent}
                        readonly={readonly}
                        expanded={expanded}
                        fallback={textarea}
                    />
                </Suspense>
            ) : textarea}
        </div>
    );
}

// 1. Define the base props that they all share
type BaseIconProps = {
    icon: React.ReactNode;
    title?: string;
};

// 2. Define the three mutually exclusive states
type IconWithLink = BaseIconProps & {
    link: string;
    callback?: never;
};

type IconWithCallback = BaseIconProps & {
    callback: () => void;
    link?: never;
};

type IconWithNeither = BaseIconProps & {
    link?: never;
    callback?: never;
};

// 3. Combine them into a union
type IconProps = IconWithLink | IconWithCallback | IconWithNeither;

/**
 * Renders a single icon with an optional tooltip, click callback, or router link.
 * Pass `callback` for click-only actions or `link` for navigation; neither renders a static icon.
 *
 * @example
 * <NoteIcon icon={<Eye className="text-success" />} title="Visible" />
 * <NoteIcon icon={<Plus className="text-success" />} title="Add" callback={handleAdd} />
 */
export function NoteIcon({ icon, title, callback, link }: IconProps) {

    const iconElement = icon as React.ReactElement<React.HTMLAttributes<HTMLElement>>;

    const inner = (
        <div className={`flex gap-2 items-center ${callback || link ? 'cursor-pointer' : ''}`}
            onClick={callback}
        >
            <div title={title ? title : undefined}>
                {
                    cloneElement(iconElement, {
                        className: twMerge(iconElement.props.className, 'h-5 w-5')
                    })
                }
            </div>
        </div>
    );

    if (link) {
        return (
            <Link to={link}>
                {inner}
            </Link>
        );
    } else return inner;
}

export type NoteIconActionProps =
    | { callback: () => void; link?: never }
    | { link: string; callback?: never }
    | { callback?: never; link?: never }

/**
 * Dispatches to the correct `NoteIcon` variant based on whether `props` carries a `callback`, a `link`, or neither.
 * Centralises the discriminated-union branching so predefined icon components stay one-liners.
 *
 * @example
 * buildIcon(<Eye className="text-success" />, 'Visible', {})
 * buildIcon(<Plus className="text-success" />, 'Add', { callback: handleAdd })
 */
export function buildIcon(icon: React.ReactNode, title: string, props: NoteIconActionProps) {
    if ('link' in props && props.link !== undefined) {
        return <NoteIcon icon={icon} title={title} link={props.link} />;
    }
    if ('callback' in props && props.callback !== undefined) {
        return <NoteIcon icon={icon} title={title} callback={props.callback} />;
    }
    return <NoteIcon icon={icon} title={title} />;
}
