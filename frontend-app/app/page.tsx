import { Boxes } from "@/components/ui/background-boxes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-amber-50 relative overflow-hidden">
      <Boxes />
      <Card className="relative z-10 max-w-2xl mx-4 bg-amber-50">
        <CardContent className="flex flex-col items-center justify-center gap-8 py-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
              EmployAI
            </h1>
            <p className="text-lg text-gray-600 sm:text-xl">
              Access your documents seamlessly
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 mt-4">
            <Button
              asChild
              variant="default"
              size="lg"
              className="min-w-[200px]"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-w-[200px]"
            >
              <Link href="/admin/sign-in">I am an administrator</Link>
            </Button>
          </div>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-3 justify-center text-xs sm:text-sm">
              <Link
                href="/legal"
                className="text-gray-600 hover:text-amber-600 hover:underline transition-colors"
              >
                Terms &amp; Conditions
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/rules"
                className="text-gray-600 hover:text-amber-600 hover:underline transition-colors"
              >
                Platform Rules
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/policy"
                className="text-gray-600 hover:text-amber-600 hover:underline transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
            <p className="text-center text-xs text-gray-500 mt-3">
              © 2025 EmployAI. For internal company use only.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
