'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import '@uiw/react-md-editor/markdown-editor.css';

// Cargar el editor dinámicamente para evitar problemas con SSR
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
  const [value, setValue] = useState(content);

  const handleChange = (newValue: string | undefined) => {
    const updatedValue = newValue || '';
    setValue(updatedValue);
    onChange(updatedValue);
  };

  return (
    <div
      data-color-mode="light"
      className="w-full  text-black border border-stone-300 rounded shadow-sm"
    >
      <MDEditor
        value={value}
        onChange={handleChange}
        style={{
          whiteSpace: 'pre-wrap',
          minHeight: '320px', // Ajusta la altura según sea necesario
          background: '#fff',
          color: '#000',
          padding: '3px',
        }}
      />
    </div>
  );
}
