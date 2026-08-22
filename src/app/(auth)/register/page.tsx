import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import RegisterPage from '@/views/RegisterPage';

export const metadata: Metadata = {
  title: 'Create Account | ApnaStay India',
  description: 'Create your ApnaStay account as a Tenant or Property Owner and enjoy zero-brokerage rentals across India.'
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
      <RegisterPage />
    </Suspense>
  );
}
