import React from 'react';

/**
 * Utility to convert raw LaTeX mathematical symbols to clean Unicode equivalents
 * for rich display without requiring heavy KaTeX/MathJax bundles.
 */
export const formatMathText = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/\\le\b|\\leq\b/g, '≤')
    .replace(/\\ge\b|\\geq\b/g, '≥')
    .replace(/\\times\b/g, '×')
    .replace(/\\approx\b/g, '≈')
    .replace(/\\ne\b|\\neq\b/g, '≠')
    .replace(/\\pm\b/g, '±')
    .replace(/\\dots\b|\\cdots\b|\\ldots\b/g, '…')
    .replace(/\\cdot\b/g, '·')
    .replace(/\\theta\b/g, 'θ')
    .replace(/\\alpha\b/g, 'α')
    .replace(/\\beta\b/g, 'β')
    .replace(/\\lambda\b/g, 'λ')
    .replace(/\\sum\b/g, '∑')
    .replace(/\\prod\b/g, '∏')
    .replace(/\\partial\b/g, '∂')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt/g, '√')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\hat\{([a-zA-Z])\}/g, '$1̂')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\min\b/g, 'min')
    .replace(/\\max\b/g, 'max')
    .replace(/\\log\b/g, 'log')
    .replace(/\\ln\b/g, 'ln')
    .replace(/\\in\b/g, '∈')
    .replace(/\\forall\b/g, '∀')
    .replace(/\\exists\b/g, '∃')
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}')
    .replace(/\\\|/g, '||')
    .replace(/\\\\/g, ' ')
    .replace(/\{([^}]+)\}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Tokenize a line of text into inline elements:
 * - Display Math: $$...$$
 * - Inline Math: $...$
 * - Bold: **...**
 * - Inline Code: `...`
 */
export const renderInlineContent = (text: string): React.ReactNode => {
  if (!text) return null;

  // Regex to split by math ($$...$$ or $...$), bold (**...**), and inline code (`...`)
  const TOKEN_REGEX = /(\$\$[\s\S]*?\$\$|\$(?!\s)[^$\n]+?(?<!\s)\$|\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(TOKEN_REGEX);

  return parts.map((part, i) => {
    if (!part) return null;

    // Display math: $$...$$
    if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
      const math = part.slice(2, -2);
      return (
        <span
          key={i}
          className="inline-block my-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/90 font-mono text-xs sm:text-[13px] text-amber-700 dark:text-amber-400 font-semibold border border-neutral-200 dark:border-neutral-700/80 shadow-2xs"
        >
          {formatMathText(math)}
        </span>
      );
    }

    // Inline math: $...$
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const math = part.slice(1, -1);
      return (
        <span
          key={i}
          className="font-mono text-xs sm:text-[12px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium border border-amber-500/20"
        >
          {formatMathText(math)}
        </span>
      );
    }

    // Bold text: **...**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-bold text-neutral-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Inline code: `...`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800/90 font-mono text-[11px] sm:text-xs text-blue-600 dark:text-blue-400 font-semibold border border-neutral-200/80 dark:border-neutral-700/80"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
};

interface ProblemDescriptionRendererProps {
  markdown: string;
  problemTitle?: string;
}

/**
 * Extracts constraints block from markdown if present, returning cleaned markdown and extracted constraints.
 */
export const extractConstraintsFromMarkdown = (markdown: string): {
  cleanedMarkdown: string;
  extractedConstraints: string[];
} => {
  if (!markdown) return { cleanedMarkdown: '', extractedConstraints: [] };

  const constraintsMatch = markdown.match(/###\s*Constraints\s*\n([\s\S]*?)(?=(?:\n###\s|\n##\s|$))/i);
  if (!constraintsMatch) {
    return { cleanedMarkdown: markdown, extractedConstraints: [] };
  }

  const rawConstraintLines = constraintsMatch[1].trim().split('\n');
  const extractedConstraints = rawConstraintLines
    .map(line => line.trim().replace(/^[-*•]\s*/, ''))
    .filter(line => line.length > 0);

  const cleanedMarkdown = markdown.replace(constraintsMatch[0], '').trim();
  return { cleanedMarkdown, extractedConstraints };
};

export const ProblemDescriptionRenderer: React.FC<ProblemDescriptionRendererProps> = ({
  markdown,
  problemTitle = '',
}) => {
  if (!markdown) return null;

  // 1. Extract any embedded constraints so they don't break the standard description flow
  const { cleanedMarkdown } = extractConstraintsFromMarkdown(markdown);

  // 2. Normalize lines
  const lines = cleanedMarkdown.split('\n');

  // 3. Parse lines into structured blocks
  const blocks: React.ReactNode[] = [];
  let currentList: { type: 'bullet' | 'number'; items: { num?: string; text: string }[] } | null = null;
  let codeBlockBuffer: string[] | null = null;

  const flushList = () => {
    if (!currentList) return;
    const listKey = `list-${blocks.length}`;
    if (currentList.type === 'bullet') {
      blocks.push(
        <ul key={listKey} className="space-y-2 my-2.5 pl-0.5">
          {currentList.items.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-neutral-700 dark:text-neutral-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80 dark:bg-blue-400 mt-2 shrink-0" />
              <div className="flex-1 min-w-0">{renderInlineContent(item.text)}</div>
            </li>
          ))}
        </ul>
      );
    } else {
      blocks.push(
        <ol key={listKey} className="space-y-2 my-2.5 pl-0.5">
          {currentList.items.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed text-neutral-700 dark:text-neutral-300"
            >
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 shrink-0 w-4">
                {item.num}.
              </span>
              <div className="flex-1 min-w-0">{renderInlineContent(item.text)}</div>
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Handling multi-line code blocks ``` ... ```
    if (trimmed.startsWith('```')) {
      if (codeBlockBuffer === null) {
        flushList();
        codeBlockBuffer = [];
      } else {
        const codeText = codeBlockBuffer.join('\n');
        blocks.push(
          <pre
            key={`code-${i}`}
            className="my-3 p-3.5 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-xs leading-relaxed overflow-x-auto border border-neutral-800"
          >
            <code>{codeText}</code>
          </pre>
        );
        codeBlockBuffer = null;
      }
      continue;
    }

    if (codeBlockBuffer !== null) {
      codeBlockBuffer.push(rawLine);
      continue;
    }

    // Skip empty lines
    if (!trimmed) {
      flushList();
      continue;
    }

    // Top Header: ## ... or # ...
    if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
      flushList();
      const headerText = trimmed.replace(/^#+\s*/, '');

      // Check if this header merely repeats problemTitle or weekly sprint title
      const isDuplicateTitle =
        problemTitle &&
        (headerText.toLowerCase().includes(problemTitle.toLowerCase()) ||
          problemTitle.toLowerCase().includes(headerText.toLowerCase()) ||
          headerText.toLowerCase().startsWith('weekly code sprint'));

      if (isDuplicateTitle && blocks.length === 0) {
        // Suppress redundant top title if already shown in the parent component
        continue;
      }

      blocks.push(
        <h2
          key={`h2-${i}`}
          className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white mt-4 mb-2 pb-1.5 border-b border-neutral-200/80 dark:border-neutral-800"
        >
          {renderInlineContent(headerText)}
        </h2>
      );
      continue;
    }

    // Section Header: ### ...
    if (trimmed.startsWith('### ')) {
      flushList();
      const sectionText = trimmed.replace(/^###\s*/, '');
      blocks.push(
        <div key={`h3-wrap-${i}`} className="pt-3.5 pb-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span className="w-1.5 h-3.5 rounded-full bg-blue-500 shrink-0" />
            <span>{sectionText}</span>
          </h3>
        </div>
      );
      continue;
    }

    // Standalone Display Math: $$ ... $$
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
      flushList();
      const mathFormula = trimmed.slice(2, -2);
      blocks.push(
        <div
          key={`math-block-${i}`}
          className="my-3 px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 font-mono text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 text-center overflow-x-auto shadow-2xs"
        >
          {formatMathText(mathFormula)}
        </div>
      );
      continue;
    }

    // Bullet List items: - ... or * ... or • ...
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      const content = trimmed.replace(/^[-*•]\s*/, '');
      if (!currentList || currentList.type !== 'bullet') {
        flushList();
        currentList = { type: 'bullet', items: [] };
      }
      currentList.items.push({ text: content });
      continue;
    }

    // Numbered List items: 1. ...
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const content = numberedMatch[2];
      if (!currentList || currentList.type !== 'number') {
        flushList();
        currentList = { type: 'number', items: [] };
      }
      currentList.items.push({ num, text: content });
      continue;
    }

    // Regular paragraph
    flushList();
    blocks.push(
      <p
        key={`p-${i}`}
        className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed my-2"
      >
        {renderInlineContent(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className="space-y-1">{blocks}</div>;
};

export default ProblemDescriptionRenderer;
