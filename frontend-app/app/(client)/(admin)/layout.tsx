"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Paperclip, User, Tag, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard/>,
  },
  {
    label: "Documents",
    href: "/admin/documents",
    icon: <Paperclip />,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: <User />,
  },
  {
    label: "Tags",
    href: "/admin/tags",
    icon: <Tag />,
  },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            <div className="text-3xl">
              <User className="border-2 border-black rounded-full"/>
            </div>
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
                      ? "bg-blue-50 border border-black/10"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span
                      className={`font-medium ${
                        isActive ? "text-black" : "text-gray-700"
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
            User Dashboard
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut/>
            Logout
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
