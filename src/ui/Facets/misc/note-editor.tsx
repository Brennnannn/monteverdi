import { useEffect, useRef, useState } from 'react';
import {
    MDXEditor,
    MDXEditorMethods,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    linkPlugin,
    linkDialogPlugin,
    tablePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    toolbarPlugin,
    UndoRedo,
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    ListsToggle,
    CreateLink,
    InsertTable,
    InsertThematicBreak,
    Separator,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import './note-editor.css';

// Created once: MDXEditor reads its plugin list on mount only, so the toolbar is
// always registered and shown/hidden with a class instead.
const plugins = [
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    tablePlugin(),
    thematicBreakPlugin(),
    markdownShortcutPlugin(),
    toolbarPlugin({
        toolbarContents: () => (
            <>
                <UndoRedo />
                <Separator />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles options={['Bold', 'Italic']} />
                <Separator />
                <ListsToggle />
                <Separator />
                <CreateLink />
                <InsertTable />
                <InsertThematicBreak />
            </>
        ),
    }),
];

type NoteEditorProps = {
    content: string;
    updateContent: (content: string) => void;
    readonly?: boolean;
    expanded?: boolean;
    /** Rendered in place of the editor when `content` cannot be parsed as markdown. */
    fallback: React.ReactNode;
}

/**
 * Markdown editor body for `NoteFull`. The toolbar shows only when `expanded` and editable;
 * markdown shortcuts work either way. Loaded lazily by `NoteFull` — import that instead.
 *
 * @example
 * <NoteEditor content={notes} updateContent={setNotes} expanded fallback={<textarea />} />
 */
export function NoteEditor({ content, updateContent, readonly = false, expanded = false, fallback }: NoteEditorProps) {
    const editorRef = useRef<MDXEditorMethods>(null);
    const emitted = useRef(content);
    const [failed, setFailed] = useState(false);
    const dark = usePrefersDark();

    // The editor only reads `markdown` on mount, so push in changes that didn't originate from it.
    useEffect(() => {
        if (content === emitted.current) return;
        emitted.current = content;
        editorRef.current?.setMarkdown(content);
    }, [content]);

    const handleChange = (markdown: string, initialMarkdownNormalize: boolean) => {
        if (initialMarkdownNormalize) return;
        emitted.current = markdown;
        updateContent(markdown);
    };

    if (failed) return fallback;

    const className = [
        'note-editor',
        dark ? 'dark-theme' : '',
        readonly ? 'note-editor-readonly' : '',
        expanded && !readonly ? 'note-editor-toolbar' : '',
        expanded ? 'mdxeditor-full-height flex-1 min-h-0' : '',
    ].join(' ');

    return (
        <MDXEditor
            ref={editorRef}
            markdown={content}
            onChange={handleChange}
            onError={() => queueMicrotask(() => setFailed(true))}
            readOnly={readonly}
            suppressHtmlProcessing
            plugins={plugins}
            className={className}
            contentEditableClassName="note-prose"
            placeholder={readonly ? '' : 'Enter your note content here...'}
        />
    );
}

function usePrefersDark() {
    const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

    useEffect(() => {
        const query = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => setDark(e.matches);
        query.addEventListener('change', handleChange);
        return () => query.removeEventListener('change', handleChange);
    }, []);

    return dark;
}
