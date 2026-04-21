import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const buttonStyle = {
        padding: '6px 10px',
        borderRadius: '6px',
        border: '1px solid var(--color-border)',
        cursor: 'pointer',
        fontSize: '14px',
        background: 'var(--color-surface)',
        color: 'var(--color-text-primary)'
    };

    const activeStyle = {
        ...buttonStyle,
        background: '#e2e8f0',
        borderColor: '#cbd5e0'
    };

    return (
        <div style={{
            display: 'flex',
            gap: '6px',
            padding: '8px',
            borderBottom: '1px solid var(--color-border)',
            flexWrap: 'wrap',
            background: '#f8fafc'
        }}>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                style={editor.isActive('bold') ? activeStyle : buttonStyle}
            >
                <strong>B</strong>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                style={editor.isActive('italic') ? activeStyle : buttonStyle}
            >
                <em>I</em>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                style={editor.isActive('strike') ? activeStyle : buttonStyle}
            >
                <s>S</s>
            </button>
            <div style={{ width: '1px', background: 'var(--color-border)', margin: '0 4px' }} />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                style={editor.isActive('heading', { level: 2 }) ? activeStyle : buttonStyle}
            >
                H2
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                style={editor.isActive('heading', { level: 3 }) ? activeStyle : buttonStyle}
            >
                H3
            </button>
            <div style={{ width: '1px', background: 'var(--color-border)', margin: '0 4px' }} />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                style={editor.isActive('bulletList') ? activeStyle : buttonStyle}
            >
                • List
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                style={editor.isActive('orderedList') ? activeStyle : buttonStyle}
            >
                1. List
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                style={editor.isActive('blockquote') ? activeStyle : buttonStyle}
            >
                ""
            </button>
        </div>
    );
};

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value || '',
        parseOptions: {
            preserveWhitespace: 'full',
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '');
        }
    }, [value, editor]);

    return (
        <div style={{
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            overflow: 'hidden',
            background: 'white'
        }}>
            <MenuBar editor={editor} />
            <EditorContent
                editor={editor}
                style={{
                    minHeight: '200px',
                    padding: '16px'
                }}
            />
            <style>{`
                .tiptap {
                    outline: none;
                    min-height: 180px;
                }
                .tiptap p { margin: 0 0 0.5em; }
                .tiptap h2 { font-size: 1.5em; font-weight: 600; margin: 0.5em 0; }
                .tiptap h3 { font-size: 1.25em; font-weight: 600; margin: 0.5em 0; }
                .tiptap ul, .tiptap ol { padding-left: 1.5em; margin: 0.5em 0; }
                .tiptap blockquote {
                    border-left: 3px solid #e2e8f0;
                    padding-left: 1em;
                    margin: 0.5em 0;
                    color: #666;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
