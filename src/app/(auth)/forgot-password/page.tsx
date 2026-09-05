import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import ForgotPasswordPage from '@/views/ForgotPasswordPage';

export const metadata: Metadata = {
  title: 'Forgot Password | ApnaStay India',
  description: 'Recover access to your ApnaStay account with a secure password reset link.'
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
      <ForgotPasswordPage />
    </Suspense>
  );
}
