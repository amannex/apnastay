import React from 'react';
import type { Metadata } from 'next';
import WhyApnaStayPage from '../../views/WhyApnaStayPage';

export const metadata: Metadata = {
  title: 'Why ApnaStay | Zero Brokerage & NFC Smart-Locks in India',
  description: 'Learn how ApnaStay eliminates 1-month brokerage fees in India with NFC smart-lock self-tours, 25-point acoustic audits, and 48-hour security deposit refunds.'
};

export default function Page() {
  return <WhyApnaStayPage />;
}
