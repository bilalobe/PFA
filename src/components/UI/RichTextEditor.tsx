import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Box, Button, Divider, IconButton, Paper, Tooltip } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string | number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  content = '', 
  onChange, 
  placeholder = 'Start writing...',
  readOnly = false,
  minHeight = '200px'
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none',
        style: `min-height: ${minHeight}; padding: 1rem;`
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const url = window.prompt('URL');
    
    if (url === null) {
      return;
    }
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link')
      .setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Image URL');
    
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <Paper elevation={1} sx={{ overflow: 'hidden' }}>
      {!readOnly && (
        <Box sx={{ p: 1, borderBottom: '1px solid #eee', display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Tooltip title="Bold">
            <IconButton 
              size="small"
              onClick={() => editor.chain().focus().toggleBold().run()}
              color={editor.isActive('bold') ? 'primary' : 'default'}
            >
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Italic">
            <IconButton 
              size="small"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              color={editor.isActive('italic') ? 'primary' : 'default'}
            >
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          
          <Tooltip title="Bullet List">
            <IconButton 
              size="small"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              color={editor.isActive('bulletList') ? 'primary' : 'default'}
            >
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Numbered List">
            <IconButton 
              size="small"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              color={editor.isActive('orderedList') ? 'primary' : 'default'}
            >
              <FormatListNumberedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Blockquote">
            <IconButton 
              size="small"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              color={editor.isActive('blockquote') ? 'primary' : 'default'}
            >
              <FormatQuoteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          
          <Tooltip title="Insert Link">
            <IconButton 
              size="small"
              onClick={setLink}
              color={editor.isActive('link') ? 'primary' : 'default'}
            >
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Insert Image">
            <IconButton 
              size="small"
              onClick={addImage}
            >
              <ImageIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Box sx={{ ml: 'auto', display: 'flex' }}>
            <Tooltip title="Undo">
              <IconButton 
                size="small"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
              >
                <UndoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Redo">
              <IconButton 
                size="small"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
              >
                <RedoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}
      
      <Box sx={{ position: 'relative' }}>
        <EditorContent 
          editor={editor} 
          style={{ 
            minHeight: readOnly ? 'auto' : minHeight,
          }}
        />
        
        {!editor.getText() && !readOnly && (
          <Box sx={{
            position: 'absolute',
            top: '16px',
            left: '20px',
            color: '#aaa',
            pointerEvents: 'none'
          }}>
            {placeholder}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default RichTextEditor;