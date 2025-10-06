import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { BookOpen, Sparkles } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Voxa - Your AI-powered comic finder",
  description: "Discover and read your favorite comics with AI-powered recommendations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              {/* <div className="relative">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
              </div> */}
              <div>
                <h1 className="text-2xl font-extrabold text-[#0097B2]">
                  VOXA
                </h1>
                <p className="text-xs text-black">Your AI-powered comic finder</p>
              </div>
            </div>
            {/* add admin to /admin/books */}
          <div className="flex justify-end items-center">
            <a href="/admin/books" className="text-sm text-[#0097B2] hover:text-blue-800">
              Admin Panel
            </a>
          </div>
          </div>

          
        </header>

        <main className="min-h-screen">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600">Loading...</div>
            </div>
          }>
            {children}
          </Suspense>
        </main>

        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-600">
              © 2025 Voxa. Discover your next favorite read.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}