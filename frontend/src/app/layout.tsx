import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "NS Exports - Admin Dashboard",
    description:
        "Internal admin dashboard for NS Exports product catalog management",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} font-sans antialiased`}>
                <div className="min-h-screen bg-background">
                    <Sidebar />
                    <Topbar />
                    <main className="ml-64 pt-16">
                        <div className="p-6">{children}</div>
                    </main>
                </div>
            </body>
        </html>
    );
}
