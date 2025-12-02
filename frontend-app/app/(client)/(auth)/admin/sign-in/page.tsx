"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { Boxes } from "@/components/ui/background-boxes";

type Step = "credentials" | "otp" | "complete";

export default function AdminSignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Step 1: Verify credentials and role
      const response = await fetch(
        "/api-client/auth/admin/verify-credentials",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid credentials or not an admin");
        return;
      }

      // Step 2: Send OTP
      const otpResponse = await fetch("/api-client/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!otpResponse.ok) {
        setError("Failed to send verification code");
        return;
      }

      setStep("otp");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = async () => {
    setLoading(true);
    setError("");

    try {
      // Step 3: Complete admin sign-in
      const response = await fetch("/api-client/auth/admin/complete-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to complete sign-in");
        return;
      }

      setStep("complete");
      // Redirect to admin dashboard
      setTimeout(() => {
        router.push("/admin");
      }, 1000);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPCancel = () => {
    setStep("credentials");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-slate-900 flex flex-col items-center justify-center">
      <Boxes />
      <div className="relative z-20 w-full max-w-md px-4">
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6 pt-8">
            <div className="flex justify-center mb-4">
              <div className="bg-linear-to-r from-purple-600 to-blue-600 p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Admin Access
            </h2>
            <p className="text-center text-gray-600">
              Secure admin portal for EmployAI
            </p>
          </CardHeader>

          <CardContent className="pb-8">
            {step === "credentials" && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@employai.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="admin-remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label
                    htmlFor="admin-remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me for 7 days
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {loading ? (
                    <>
                      <Spinner className="size-4 mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>

                <div className="text-center pt-4">
                  <a
                    href="/sign-in"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Not an admin? Sign in as user
                  </a>
                </div>
              </form>
            )}

            {step === "otp" && (
              <OTPVerification
                email={email}
                onVerified={handleOTPVerified}
                onCancel={handleOTPCancel}
              />
            )}

            {step === "complete" && (
              <div className="text-center space-y-4 py-8">
                <div className="flex justify-center">
                  <div className="bg-green-100 p-4 rounded-full">
                    <svg
                      className="w-12 h-12 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Authentication Successful
                </h3>
                <p className="text-gray-600">
                  Redirecting to admin dashboard...
                </p>
                <Spinner className="size-6 mx-auto" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Protected by two-factor authentication
          </p>
        </div>
      </div>
    </div>
  );
}
