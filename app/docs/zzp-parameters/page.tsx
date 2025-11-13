import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ZZP Parameters - Documentatie',
  description: 'Documentatie van ZZP-parameters per CAO voor de vergelijker',
};

export default function ZzpParametersPage() {
  // Read the markdown file
  const filePath = join(process.cwd(), 'Docs', 'ZZP_PARAMETERS.md');
  const markdown = readFileSync(filePath, 'utf-8');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 lg:p-10">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 mt-8 first:mt-0" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 mt-8 border-b border-gray-200 pb-2" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3 mt-6" {...props} />
                ),
                h4: ({ node, ...props }) => (
                  <h4 className="text-lg md:text-xl font-semibold text-gray-700 mb-2 mt-4" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-gray-700 mb-4 leading-relaxed" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="ml-4" {...props} />
                ),
                code: ({ node, inline, ...props }: any) => {
                  if (inline) {
                    return (
                      <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                    );
                  }
                  return (
                    <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4" {...props} />
                  );
                },
                pre: ({ node, ...props }) => (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-gray-900" {...props} />
                ),
                em: ({ node, ...props }) => (
                  <em className="italic" {...props} />
                ),
                hr: ({ node, ...props }) => (
                  <hr className="my-8 border-gray-200" {...props} />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse border border-gray-300" {...props} />
                  </div>
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-gray-100" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />
                ),
                input: ({ node, ...props }: any) => {
                  if (props.type === 'checkbox') {
                    return (
                      <input
                        type="checkbox"
                        className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        disabled
                        checked={props.checked}
                        {...props}
                      />
                    );
                  }
                  return <input {...props} />;
                },
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
        
        {/* Back button */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            ← Terug naar calculator
          </a>
        </div>
      </div>
    </div>
  );
}

