import fs from "fs";
import path from "path";

function simpleMarkdownToHtml(md: string): string {
  // Very small, non-complete MD renderer for headings, lists, code fences and paragraphs
  let html = md.trim();
  // code fences ```
  html = html.replace(/```([\s\S]*?)```/g, (_m, code) => {
    const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<pre class=\"code\"><code>${escaped}</code></pre>`;
  });
  // headings ## and ###
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  // lists - item
  // turn consecutive - lines into <ul><li>...</li></ul>
  html = html.replace(/(?:^|\n)(-\s+.+(?:\n-\s+.+)*)/g, (m) => {
    const items = m
      .trim()
      .split(/\n/)
      .map((line) => line.replace(/^-\s+/, "").trim())
      .map((txt) => `<li>${txt}</li>`) 
      .join("");
    return `\n<ul>${items}</ul>`;
  });
  // ordered lists 1. 2.
  html = html.replace(/(?:^|\n)((?:\d+\.\s+.+\n?)+)/g, (_m, block) => {
    const items = block
      .trim()
      .split(/\n/)
      .map((line: string) => line.replace(/^\d+\.\s+/, "").trim())
      .map((txt: string) => `<li>${txt}</li>`) 
      .join("");
    return `\n<ol>${items}</ol>`;
  });
  // links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  // paragraphs (lines that are not tags become paragraphs)
  html = html
    .split(/\n\n+/)
    .map((chunk) => {
      if (/^\s*<\/?(h\d|ul|ol|li|pre|p)/.test(chunk)) return chunk; 
      return `<p>${chunk.replace(/\n/g, '<br/>')}</p>`;
    })
    .join("\n");
  return html;
}

export default function Page() {
  // Render the consolidated calculations document to avoid build errors when the old plan file is absent
  const mdPath = path.join(process.cwd(), "Docs", "CALCULATIES.md");
  const md = fs.readFileSync(mdPath, "utf8");
  const html = simpleMarkdownToHtml(md);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <article className="prose prose-neutral max-w-none bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div
            className="markdown"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
        <style>{`
          .prose h1, .prose h2, .prose h3 { margin-top: 1.25rem; margin-bottom: .75rem; font-weight: 700; }
          .prose p { margin: .75rem 0; line-height: 1.7; }
          .prose ul, .prose ol { margin: .5rem 0 .75rem 1.25rem; }
          .prose li { margin: .25rem 0; }
          .prose a { color: #0ea5e9; text-decoration: underline; }
          .prose pre.code { background: #0b1021; color: #e2e8f0; padding: .75rem; border-radius: .5rem; overflow:auto; }
          .prose code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        `}</style>
      </div>
    </div>
  );
}


