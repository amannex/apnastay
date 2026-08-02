import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginPage from '@/views/LoginPage';

export const metadata: Metadata = {
  title: 'Log In | OwnStay India',
  description: 'Log in to your OwnStay account to manage your verified apartment tours, digital agreements, and zero-brokerage rentals.'
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 rounded-full border-2 border-[#1D1D1F] border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
