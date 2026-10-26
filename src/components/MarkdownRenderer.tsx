import React, { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Render inline formatting (bold, italics, inline code, links)
  const renderInline = (text: string) => {
    // Split by markdown link pattern [label](url)
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderFormatting(text.substring(lastIndex, match.index)));
      }
      const label = match[1];
      const url = match[2];
      parts.push(
        <a
          key={`link-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-sky-400 hover:text-sky-300 underline underline-offset-2 font-medium"
        >
          {label}
          <ExternalLink className="w-3 h-3 inline ml-0.5" />
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(renderFormatting(text.substring(lastIndex)));
    }

    return parts.length > 0 ? parts : renderFormatting(text);
  };

  const renderFormatting = (text: string): React.ReactNode => {
    // Process code `...`
    const codeSegments = text.split(/(`[^`]+`)/g);

    return codeSegments.map((segment, segIdx) => {
      if (segment.startsWith('`') && segment.endsWith('`') && segment.length >= 2) {
        return (
          <code
            key={`inline-code-${segIdx}`}
            className="px-1.5 py-0.5 text-xs font-mono rounded bg-slate-800/80 text-sky-300 border border-slate-700/60"
          >
            {segment.slice(1, -1)}
          </code>
        );
      }

      // Bold **...** and Italics *...*
      const boldSegments = segment.split(/(\*\*[^*]+\*\*)/g);
      return boldSegments.map((bSegment, bIdx) => {
        if (bSegment.startsWith('**') && bSegment.endsWith('**') && bSegment.length >= 4) {
          return (
            <strong key={`b-${segIdx}-${bIdx}`} className="font-bold text-white">
              {bSegment.slice(2, -2)}
            </strong>
          );
        }

        const italicSegments = bSegment.split(/(\*[^*]+\*)/g);
        return italicSegments.map((iSegment, iIdx) => {
          if (iSegment.startsWith('*') && iSegment.endsWith('*') && iSegment.length >= 2) {
            return (
              <em key={`i-${segIdx}-${bIdx}-${iIdx}`} className="italic text-slate-200">
                {iSegment.slice(1, -1)}
              </em>
            );
          }
          return iSegment;
        });
      });
    });
  };

  // Split lines into blocks (code blocks, headers, quotes, lists, paragraphs)
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';
  let codeBlockCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check code fence
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        const fullCode = codeBuffer.join('\n');
        const currentIndex = codeBlockCounter++;
        elements.push(
          <div
            key={`code-block-${currentIndex}`}
            className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-[#0B0F19] text-xs font-mono shadow-md"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800/80 text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {codeLang || 'código'}
              </span>
              <button
                type="button"
                onClick={() => handleCopyCode(fullCode, currentIndex)}
                className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
                title="Copiar código"
              >
                {copiedIndex === currentIndex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto text-slate-200 leading-relaxed">
              <code>{fullCode}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBuffer = [];
        codeLang = '';
      } else {
        // Start code block
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      // Empty line / spacer
      elements.push(<div key={`spacer-${i}`} className="h-2" />);
      continue;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-base sm:text-lg font-bold text-sky-200 mt-3 mb-1.5 tracking-tight">
          {renderInline(trimmed.slice(4))}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg sm:text-xl font-bold text-white mt-4 mb-2 tracking-tight border-b border-slate-800/80 pb-1">
          {renderInline(trimmed.slice(3))}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-xl sm:text-2xl font-extrabold text-white mt-4 mb-2 tracking-tight">
          {renderInline(trimmed.slice(2))}
        </h1>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-2 pl-3.5 border-l-2 border-blue-500/80 bg-blue-950/20 py-1.5 pr-3 rounded-r-lg text-slate-300 italic text-sm"
        >
          {renderInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered List
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      elements.push(
        <li key={`li-${i}`} className="ml-4 list-disc text-slate-200 text-sm leading-relaxed my-0.5 marker:text-blue-400">
          {renderInline(trimmed.slice(2))}
        </li>
      );
      continue;
    }

    // Numbered List
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <li
          key={`num-li-${i}`}
          className="ml-4 list-decimal text-slate-200 text-sm leading-relaxed my-0.5 marker:text-violet-400 font-normal"
        >
          {renderInline(numMatch[2])}
        </li>
      );
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed text-slate-200 my-1">
        {renderInline(trimmed)}
      </p>
    );
  }

  return <div className={`space-y-0.5 ${className}`}>{elements}</div>;
};
