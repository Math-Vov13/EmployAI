"use client";

import { Boxes } from "@/components/ui/background-boxes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OTPVerification } from "@/components/auth/OTPVerification";

type Step = "credentials" | "otp" | "complete";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Step 1: Verify credentials (without creating session)
      const response = await fetch("/api-client/auth/verify-user-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid credentials");
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
      console.error("Error signing in:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = async () => {
    setLoading(true);
    setError("");

    try {
      // Step 3: Complete user sign-in
      const response = await fetch("/api-client/auth/user/complete-signin", {
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
      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard");
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

  const handleGoogleAuth = () => {
    globalThis.location.href = "/api-client/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 relative overflow-hidden p-4">
      <Boxes />
      <Card className="relative z-10 w-full max-w-md bg-amber-50">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl font-(family-name:--font-poppins)">
              EmployAI
            </h1>
          </div>
          {step === "credentials" && (
            <>
              <CardTitle className="text-xl text-center text-gray-900">
                Welcome back
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Sign in to your account to continue
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {step === "credentials" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 text-base"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 text-base"
                />
                {error && <FieldError>{error}</FieldError>}
              </Field>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me for 7 days
                </label>
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner />
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-amber-50 px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 font-semibold"
                onClick={handleGoogleAuth}
                disabled={loading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>
                  Don't have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="font-semibold text-gray-900 hover:text-gray-700"
                  >
                    Sign up
                  </Link>
                </p>
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
                Sign In Successful
              </h3>
              <p className="text-gray-600">Redirecting to dashboard...</p>
              <Spinner className="size-6 mx-auto" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
