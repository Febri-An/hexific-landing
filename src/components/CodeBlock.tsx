'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
}

export function CodeBlock({
  code,
  language = 'solidity',
  filename,
  showLineNumbers = true,
  maxHeight = '400px'
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      solidity: 'Solidity',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      json: 'JSON',
      bash: 'Bash',
    };
    return labels[lang] || lang.toUpperCase();
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-700/50 bg-[#1e1e1e]">
      {/* Editor Header - like VS Code tab */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          {/* File/Language icon */}
          <svg className="w-4 h-4 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span className="text-sm text-gray-300 font-mono">
            {filename || getLanguageLabel(language)}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${copied
              ? 'bg-lime-400/20 text-lime-400'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white hover:cursor-pointer'
            }`}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div style={{ maxHeight, overflow: 'auto' }}>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers={showLineNumbers}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: '#6e7681',
            borderRight: '1px solid #30363d',
            marginRight: '1em',
          }}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.8125rem',
            lineHeight: '1.6',
            background: 'transparent',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            }
          }}
        >
          {code.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}