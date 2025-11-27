import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Boxes } from "@/components/ui/background-boxes";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-amber-50 relative overflow-hidden">
      <Boxes/>
      <Card className="relative z-10 max-w-2xl mx-4 bg-amber-50">
        <CardContent className="flex flex-col items-center justify-center gap-8 py-12 text-center font-[family-name:--font-figtree]">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl font-(family-name:--font-poppins)">
              EmployAI
            </h1>
            <p className="text-lg text-gray-600 sm:text-xl font-(family-name:--font-poppins)">
              Access your documents seamlessly
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 mt-4">
            <Button asChild variant="default" size="lg" className="min-w-[200px]">
              <Link href="/sign-in" className="font-[family-name:--font-figtree]">Sign in</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[200px]">
              <Link href="/admin" className="font-[family-name:--font-figtree]">I am an administrator</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
