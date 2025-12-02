"use client";

import { validateEmail, validatePassword } from "@/app/lib/validations/auth";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { Boxes } from "@/components/ui/background-boxes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { useState } from "react";

type Step = "credentials" | "otp" | "complete";

export default function AdminSignInPage() {
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const validateEmailField = (email: string): boolean => {
    const result = validateEmail(email);
    if (!result.success) {
      setEmailError(result.error!);
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePasswordField = (password: string): boolean => {
    const result = validatePassword(password);
    if (!result.success) {
      setPasswordError(result.error!);
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear all errors
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    // Validate fields
    const isEmailValid = validateEmailField(email);
    const isPasswordValid = validatePasswordField(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

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
        // Map server errors to specific fields
        if (data.error?.toLowerCase().includes("email")) {
          setEmailError(data.error);
        } else if (data.error?.toLowerCase().includes("password")) {
          setPasswordError(data.error);
        } else if (data.error?.toLowerCase().includes("admin")) {
          setGeneralError(data.error || "Invalid credentials or not an admin");
        } else {
          setPasswordError(data.error || "Invalid email or password");
        }
        return;
      }

      // Step 2: Send OTP
      const otpResponse = await fetch("/api-client/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!otpResponse.ok) {
        setGeneralError("Failed to send verification code");
        return;
      }

      setStep("otp");
    } catch (err) {
      console.error("Error signing in:", err);
      setGeneralError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = async () => {
    setLoading(true);
    setGeneralError("");

    try {
      // Step 3: Complete admin sign-in
      const response = await fetch("/api-client/auth/admin/complete-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        setGeneralError(data.error || "Failed to complete sign-in");
        setLoading(false);
        return;
      }

      setStep("complete");
      // Use window.location.href to force full page reload with new session cookies
      setTimeout(() => {
        window.location.href = "/admin";
      }, 1000);
    } catch (err) {
      setGeneralError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleOTPCancel = () => {
    setStep("credentials");
    setEmail("");
    setPassword("");
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
                Admin Access
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Secure admin portal for EmployAI
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {step === "credentials" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {generalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {generalError}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="email">Admin Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@employai.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  disabled={loading}
                  className={`h-11 text-base ${emailError ? "border-red-500" : ""}`}
                />
                {emailError && <FieldError>{emailError}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  disabled={loading}
                  className={`h-11 text-base ${passwordError ? "border-red-500" : ""}`}
                />
                {passwordError && <FieldError>{passwordError}</FieldError>}
              </Field>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  disabled={loading}
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                  "Sign In as Admin"
                )}
              </Button>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>
                  Not an admin?{" "}
                  <Link
                    href="/sign-in"
                    className="font-semibold text-gray-900 hover:text-gray-700"
                  >
                    Sign in as user
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
              <p className="text-gray-600">Redirecting to admin dashboard...</p>
              <Spinner className="size-6 mx-auto" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
