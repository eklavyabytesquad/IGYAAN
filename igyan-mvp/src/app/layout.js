"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./utils/auth_context";
import "./globals.css";

function LayoutContent({ children }) {
	const pathname = usePathname();
	const isDashboard = pathname?.startsWith("/dashboard");
	const isLogin = pathname === "/login" || pathname?.startsWith("/login/");
	const isAuthPage = isLogin || pathname === "/forgot-password";
	const isRegister = pathname?.startsWith("/register/");

	return (
		<AuthProvider>
			{isDashboard || isAuthPage || isRegister ? (
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
				<title>IGYAN AI -Native Operating System</title>
				<link rel="icon" href="/apple-icon.png" type="image/png" />
				<link rel="apple-touch-icon" href="/apple-icon.png" />
			</head>
			<body className="antialiased bg-background text-foreground">
				<ThemeProvider>
					<LayoutContent>{children}</LayoutContent>
				</ThemeProvider>
			</body>
		</html>
	);
}
