import React from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

export default function RichTextEditor() {
  const [editorState, setEditorState] = React.useState(() => EditorState.createEmpty());

  return (
    <Editor
      editorState={editorState}
      onEditorStateChange={setEditorState}
      wrapperClassName="rich-text-editor-wrapper"
      editorClassName="rich-text-editor"
    />
  );
}