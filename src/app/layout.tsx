import { cn } from "@/lib/utils";
import "./globals.css";
import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import Navbar from "@/components/Navbar";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";


const lexend = Lexend({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Learning Journey",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(lexend.className, "antialiased min-h-screen pt-16")}>
       <ThemeProvider attribute='class'
       defaultTheme="system"
       enableSystem
       disableTransitionOnChange>
          <Navbar />
          {children}
          <Toaster />
       </ThemeProvider>
      </body>
    </html>
  );
}