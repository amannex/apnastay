import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import ResetPasswordPage from '@/views/ResetPasswordPage';

export const metadata: Metadata = {
  title: 'Reset Password | ApnaStay India',
  description: 'Set a new secure password for your ApnaStay account.'
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
      <ResetPasswordPage />
    </Suspense>
  );
}
