'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Card, CardBody, CardHeader } from '@heroui/card';

export default function AdminSecretPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-admin-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid admin code');
        setLoading(false);
        setCode('');
        return;
      }

      // Redirect to admin dashboard
      router.push('/admin');
    } catch (err) {
      console.error('Error verifying admin code:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Redirect to user dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-2 px-6 pt-6 pb-0">
          <div className="flex items-center justify-center w-full mb-2">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg">
              <h1 className="text-2xl font-bold">EmployAI Admin</h1>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center">Admin verification</h2>
          <p className="text-sm text-gray-600 text-center">
            Enter the admin secret code to access admin features
          </p>
        </CardHeader>
        <CardBody className="px-6 py-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="password"
              label="Admin secret code"
              placeholder="Enter admin code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              isDisabled={loading}
              variant="bordered"
              size="lg"
              classNames={{
                input: 'text-base',
                label: 'text-sm font-medium',
              }}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
              <p className="font-medium mb-1">⚠️ Admin access only</p>
              <p>Only authorized administrators should enter this code. Unauthorized access attempts will be logged.</p>
            </div>

            <Button
              type="submit"
              color="secondary"
              size="lg"
              isLoading={loading}
              className="w-full font-semibold"
            >
              {loading ? 'Verifying...' : 'Verify admin code'}
            </Button>

            <Button
              type="button"
              variant="light"
              size="lg"
              onClick={handleSkip}
              isDisabled={loading}
              className="w-full"
            >
              Continue as regular user
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>
              Admin code is provided by your system administrator.<br />
              If you don't have it, continue as a regular user.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
