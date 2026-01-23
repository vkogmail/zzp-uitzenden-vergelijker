import { readFileSync } from 'fs';
import { join } from 'path';
import type { Metadata } from 'next';
import { MarkdownPage } from '@/components/MarkdownPage';

export const metadata: Metadata = {
  title: 'Berekeningen - Documentatie',
  description: 'Volledige documentatie van de berekeningslogica voor ZZP vs Detacheren vergelijker',
};

export default function CalculatiesPage() {
  const filePath = join(process.cwd(), 'Docs', 'CALCULATIES.md');
  const markdown = readFileSync(filePath, 'utf-8');

  return <MarkdownPage markdown={markdown} />;
}
