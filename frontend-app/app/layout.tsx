import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const font = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EmployAI - Access your documents seamlessly",
  description: "Employee document management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
