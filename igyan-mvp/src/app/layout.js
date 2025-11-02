"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./utils/auth_context";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

function LayoutContent({ children }) {
	const pathname = usePathname();
	const isDashboard = pathname?.startsWith("/dashboard");

	return (
		<AuthProvider>
			{isDashboard ? (
				// Dashboard layout - no navbar/footer
				<>{children}</>
			) : (
				// Public pages layout - with navbar/footer
				<div className="flex min-h-screen flex-col">
					<Navbar />
					<main className="flex-1">{children}</main>
					<Footer />
				</div>
			)}
		</AuthProvider>
	);
}

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
			>
				<ThemeProvider>
					<LayoutContent>{children}</LayoutContent>
				</ThemeProvider>
			</body>
		</html>
	);
}