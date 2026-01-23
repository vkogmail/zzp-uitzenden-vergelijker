import { readFileSync } from 'fs';
import { join } from 'path';
import type { Metadata } from 'next';
import { MarkdownPage } from '@/components/MarkdownPage';

export const metadata: Metadata = {
  title: 'ZZP Parameters - Documentatie',
  description: 'Documentatie van ZZP-parameters per CAO voor de vergelijker',
};

export default function ZzpParametersPage() {
  const filePath = join(process.cwd(), 'Docs', 'ZZP_PARAMETERS.md');
  const markdown = readFileSync(filePath, 'utf-8');

  return <MarkdownPage markdown={markdown} />;
}
