import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TabNav } from "@/components/layout/tab-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Social Media Writer",
  description: "Manage your LinkedIn content pipeline",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="h-screen flex flex-col overflow-hidden">
          <TabNav />
          <main className="flex-1 flex flex-col overflow-hidden p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
