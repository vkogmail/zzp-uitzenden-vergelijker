import { readFileSync } from 'fs';
import { join } from 'path';
import type { Metadata } from 'next';
import { MarkdownPage } from '@/components/MarkdownPage';

export const metadata: Metadata = {
  title: 'Release Notes - Sheet Arsenaal Alignment',
  description: 'Release notes voor de alignment van presets met Sheet Arsenaal kostprijsgegevens en gedetailleerde werkgeverslasten',
};

export default function ReleaseNotesPage() {
  const filePath = join(process.cwd(), 'Docs', 'RELEASE_NOTES_2026_CSV_ALIGNMENT.md');
  const markdown = readFileSync(filePath, 'utf-8');

  return <MarkdownPage markdown={markdown} />;
}
