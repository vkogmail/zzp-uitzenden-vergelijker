"use client";

import { MessageCircle } from 'lucide-react';

export function FeedbackButton() {
  const subject = encodeURIComponent('Feedback: Income Calculator');
  const mailtoLink = `mailto:vincent@createnew.co?subject=${subject}`;

  return (
    <a
      href={mailtoLink}
      className="ml-auto bg-gray-900 hover:bg-gray-800 text-white px-4 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer"
      style={{
        borderRadius: '8px',
        backgroundColor: 'rgb(13, 13, 18)',
        height: '40px',
      }}
      aria-label="Geef feedback"
    >
      <MessageCircle className="w-4 h-4" />
      <span className="hidden sm:inline">Feedback</span>
    </a>
  );
}
