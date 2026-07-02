'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import api from '@/services/api';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Redirect back if email parameter is missing
      router.push('/register');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('OTP must be exactly 6 digits.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { email, code });
      
      // Save session credentials
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      
      // Redirect to feed/dashboard
      router.push('/');
      router.refresh();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Verification failed. Please check the code and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-90 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Dogear Logo" className="h-10 w-10 rounded-lg object-contain" />
          <span className="font-serif text-3xl font-bold tracking-tight text-emerald-950">Dogear</span>
        </Link>
        <h2 className="font-serif text-3xl font-bold text-stone-900">Verify your email</h2>
        <p className="mt-2 text-sm text-stone-600">
          We sent a 6-digit code to <span className="font-medium text-stone-900">{email}</span>.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-stone-200 shadow-sm sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 p-4 flex gap-3 text-sm text-red-800 border border-red-100">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-stone-700 text-center mb-2">
                Enter Verification Code
              </label>
              <div className="mt-1 relative rounded-md shadow-sm max-w-[200px] mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <input
                  id="code"
                  name="code"
                  type="text"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-lg text-center font-mono text-xl tracking-[0.3em] bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 transition-all"
                  placeholder="000000"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[#1E3F20] hover:bg-[#152e17] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Verify & Log In'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-stone-500">
            Didn't receive the email? Double-check your backend console logs for the code, or click{' '}
            <Link href="/register" className="text-emerald-800 hover:text-emerald-950 font-semibold underline">
              Start Over
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Verify() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="h-8 w-8 text-emerald-800 animate-spin" />
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}
