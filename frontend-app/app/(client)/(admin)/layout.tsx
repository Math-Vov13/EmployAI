"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "📊",
  },
  {
    label: "Documents",
    href: "/admin/documents",
    icon: "📄",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: "👥",
  },
  {
    label: "Tags",
    href: "/admin/tags",
    icon: "🏷️",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api-client/auth/logout", { method: "POST" });
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="text-3xl">👨‍💼</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EmployAI</h1>
              <Badge variant="secondary">Admin</Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`w-full p-3 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-blue-50 border border-blue-500"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span
                      className={`font-medium ${
                        isActive ? "text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleBackToDashboard}
          >
            📱 User Dashboard
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            🚪 Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
