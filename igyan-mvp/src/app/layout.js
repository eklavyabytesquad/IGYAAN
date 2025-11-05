"use client";

import Script from "next/script";
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
		<html lang="en" suppressHydrationWarning data-theme="dark" className="dark">
			<head>
				<Script id="force-dark-theme" strategy="beforeInteractive">{`
					(function ensureDarkTheme(){
						var root = document.documentElement;
						if (!root) return;
						root.classList.add('dark');
						root.dataset.theme = 'dark';
						if (document.body) {
							document.body.style.colorScheme = 'dark';
						}
						try {
							window.localStorage.setItem('igyan-theme', 'dark');
						} catch (error) {
							/* ignore storage access issues */
						}
					})();
				`}</Script>
			</head>
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