/**
 * Rich text editor component using TipTap
 * Provides WYSIWYG editing with a toolbar
 */
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Code,
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  disabled?: boolean
  className?: string
}

interface ToolbarButtonProps {
  onClick: () => void
  disabled?: boolean
  active?: boolean
  children: React.ReactNode
  title: string
}

function ToolbarButton({
  onClick,
  disabled,
  active,
  children,
  title,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        'h-8 w-8 p-0',
        'transition-all duration-200 ease-in-out',
        active && 'bg-accent text-accent-foreground',
        'hover:scale-105 active:scale-95'
      )}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  )
}

export function RichTextEditor({
  content,
  onChange,
  disabled = false,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className={cn(
      'rounded-md border bg-card',
      'transition-all duration-200 ease-in-out',
      'focus-within:ring-2 focus-within:ring-primary/50',
      disabled && 'opacity-60',
      className
    )}>
      <div className={cn(
        'flex flex-wrap items-center gap-1 border-b bg-muted/50 p-1',
        'animate-in fade-in slide-in-from-top-2 duration-200'
      )}>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled || !editor.can().chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled || !editor.can().chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={disabled || !editor.can().chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <div className="h-4 w-[1px] bg-border" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled || !editor.can().chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled || !editor.can().chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled || !editor.can().chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <div className="h-4 w-[1px] bg-border" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().chain().focus().undo().run()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().chain().focus().redo().run()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <EditorContent
        editor={editor}
        className={cn(
          'prose prose-sm dark:prose-invert max-w-none',
          'p-3 focus-visible:outline-none',
          'transition-opacity duration-200 ease-in-out',
          disabled && 'opacity-60'
        )}
      />
    </div>
  )
} 