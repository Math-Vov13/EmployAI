'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { InputOtp } from '@heroui/input-otp';

import { Spinner } from '@heroui/spinner';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Redirect to login if no email
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take last digit
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (index === 5 && value) {
      const fullCode = [...newCode.slice(0, 5), value].join('');
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setCode(newCode);

    // Focus last filled input or submit if complete
    if (pastedData.length === 6) {
      handleSubmit(pastedData);
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  const handleSubmit = async (codeStr?: string) => {
    const finalCode = codeStr || code.join('');

    if (finalCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: finalCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid verification code');
        setLoading(false);
        // Clear code on error
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      // Check if user needs admin verification
      if (data.user.role !== 'ADMIN') {
        // Regular user - redirect to dashboard
        router.push('/dashboard');
      } else {
        // Already admin - redirect to admin dashboard
        router.push('/admin');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to resend code');
        setLoading(false);
        return;
      }

      // Clear code and show success
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setLoading(false);
      // Could add a toast notification here
    } catch (err) {
      console.error('Error resending OTP:', err);
      setError('Failed to resend code');
      setLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-2 px-6 pt-6 pb-0">
          <div className="flex items-center justify-center w-full mb-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg">
              <h1 className="text-2xl font-bold">EmployAI</h1>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center">Enter verification code</h2>
          <p className="text-sm text-gray-600 text-center">
            We sent a 6-digit code to<br />
            <span className="font-medium text-gray-800">{email}</span>
          </p>
        </CardHeader>
        <CardBody className="px-6 py-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col gap-6">
            {/* 6-digit OTP input */}
            <div className="flex gap-2 justify-center">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={loading}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                />
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              color="primary"
              size="lg"
              isLoading={loading}
              className="w-full font-semibold"
            >
              {loading ? 'Verifying...' : 'Verify code'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Resend code
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to login
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"><Spinner size="lg" /></div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
