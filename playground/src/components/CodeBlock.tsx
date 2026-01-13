import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'typescript', title = 'Code' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: '#1e1e1e',
      borderRadius: '8px',
      overflow: 'hidden',
      marginTop: '16px',
      marginBottom: '16px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        background: '#252526',
        borderBottom: '1px solid #3c3c3c',
      }}>
        <span style={{
          color: '#cccccc',
          fontSize: '14px',
          fontWeight: '500',
        }}>{title}</span>
        <button
          onClick={handleCopy}
          style={{
            background: copied ? '#4caf50' : '#3c3c3c',
            color: 'white',
            border: 'none',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {copied ? '已复制!' : '复制代码'}
        </button>
      </div>
      <pre style={{
        margin: '0',
        padding: '16px',
        overflow: 'auto',
        fontSize: '13px',
        lineHeight: '1.6',
        color: '#d4d4d4',
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
};
