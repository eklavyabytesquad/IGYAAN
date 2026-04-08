"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../../app/utils/auth_context";
import { supabase } from "../../app/utils/supabase";
import { getNavSections, getMasterNavSections, ROLE_ACCESS, getMustHaveKeys } from "./sidenav-config";
import { ChevronsLeft, X } from "lucide-react";

/**
 * Master Sidenav — single sidenav component for ALL dashboard roles.
 * Replaces all legacy per-role sidenavs (faculty-sidenav, student-sidenav, etc.)
 *
 * Access logic:
 *  1. super_admin → sees everything from their role nav
 *  2. b2c_student / b2c_mentor → role defaults, no user_access restrictions
 *  3. Institutional users (faculty, student, co_admin, counselor, parent):
 *     - If user_access table has entries for this user → WHITELIST mode:
 *       renders MASTER_NAV filtered to only granted modules
 *     - If user_access table has NO entries → role-specific defaults
 */
export default function UnifiedSidenav({ isOpen, setIsOpen, isCollapsed, setIsCollapsed, schoolData }) {
	const pathname = usePathname();
	const { user } = useAuth();
	// undefined = still loading, null = no whitelist, Set = active whitelist
	const [userModules, setUserModules] = useState(undefined);
	const [loadingAccess, setLoadingAccess] = useState(true);

	const portalLabels = {
		super_admin: { title: "Admin Portal", subtitle: "Full System Control" },
		co_admin: { title: "Admin Portal", subtitle: "School Management" },
		faculty: { title: "Faculty Portal", subtitle: "Teaching & Assessment" },
		student: { title: "Student Portal", subtitle: "Learning & Innovation Hub" },
		counselor: { title: "Counselor Portal", subtitle: "Well-being & Guidance" },
		parent: { title: "Parent Portal", subtitle: "Track & Connect" },
		b2c_student: { title: "Launch Pad", subtitle: "Build · Pitch · Launch" },
		b2c_mentor: { title: "Mentor Console", subtitle: "Guide · Review · Impact" },
	};
	const portal = portalLabels[user?.role] || portalLabels.student;

	// ══════════════════════════════════════════════════════════════
	//  Fetch user_access whitelist from DB
	// ══════════════════════════════════════════════════════════════
	useEffect(() => {
		if (!user) return;

		// B2C users don't use user_access — skip fetch
		const B2C = ["b2c_student", "b2c_mentor"];
		if (B2C.includes(user.role)) {
			setUserModules(null);
			setLoadingAccess(false);
			return;
		}
		// All institutional users (including super_admin) check user_access

		let cancelled = false;

		(async () => {
			try {
				const { data, error } = await supabase
					.from("user_access")
					.select("module_name")
					.eq("user_id", user.id);

				if (cancelled) return;

				if (error) {
					console.error("[MasterSidenav] user_access query error:", error.message, error.details, error.hint);
					setUserModules(null); // graceful fallback — show role defaults
					return;
				}

				if (data && data.length > 0) {
					const moduleSet = new Set(data.map((d) => d.module_name));
					console.log("[MasterSidenav] Whitelist active:", [...moduleSet]);
					setUserModules(moduleSet);
				} else {
					console.log("[MasterSidenav] No user_access entries for", user.id, "— showing role defaults");
					setUserModules(null);
				}
			} catch (err) {
				if (!cancelled) {
					console.error("[MasterSidenav] Exception fetching user_access:", err);
					setUserModules(null);
				}
			} finally {
				if (!cancelled) setLoadingAccess(false);
			}
		})();

		return () => { cancelled = true; };
	}, [user]);

	// ══════════════════════════════════════════════════════════════
	//  Pick nav sections based on whitelist state
	// ══════════════════════════════════════════════════════════════
	const rawSections = useMemo(() => {
		if (!user) return [];
		// Whitelist active → use MASTER_NAV so all granted items can render
		if (userModules instanceof Set) return getMasterNavSections();
		// No whitelist → use the curated role-specific nav
		return getNavSections(user.role);
	}, [user, userModules]);

	// ══════════════════════════════════════════════════════════════
	//  Access gate
	// ══════════════════════════════════════════════════════════════
	const mustHaves = user ? getMustHaveKeys(user.role) : new Set();

	const checkAccess = (itemKey) => {
		if (!user) return false;

		const B2C = ["b2c_student", "b2c_mentor"];
		if (B2C.includes(user.role)) return true;

		// Must-have items ALWAYS show (dashboard, settings, user-access for super_admin)
		if (mustHaves.has(itemKey)) return true;

		// While loading → optimistic: show whatever the role allows
		if (loadingAccess) {
			const allowed = ROLE_ACCESS[itemKey];
			return !allowed || allowed.includes(user.role);
		}

		// ── Whitelist is AUTHORITATIVE for ALL roles (including super_admin) ──
		if (userModules instanceof Set) {
			return userModules.has(itemKey);
		}

		// ── No whitelist entries ──
		if (user.role === "super_admin") return true;

		// Other roles with no whitelist → standard ROLE_ACCESS check
		const allowed = ROLE_ACCESS[itemKey];
		if (allowed && !allowed.includes(user.role)) return false;
		return true;
	};

	// ══════════════════════════════════════════════════════════════
	//  Pre-filter sections so empty ones don't render labels
	// ══════════════════════════════════════════════════════════════
	const sections = useMemo(() => {
		return rawSections
			.map((section) => ({
				...section,
				items: section.items.filter((item) => checkAccess(item.key)),
			}))
			.filter((section) => section.items.length > 0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rawSections, userModules, loadingAccess, user]);

	// ══════════════════════════════════════════════════════════════
	//  Render
	// ══════════════════════════════════════════════════════════════
	return (
		<>
			{/* Mobile overlay */}
			{isOpen && (
				<div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />
			)}

			<aside
				data-tour="sidenav"
				className={`dashboard-sidenav fixed left-0 top-0 z-50 flex h-screen transform flex-col border-r transition-all duration-300 ease-in-out lg:translate-x-0 ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				} ${isCollapsed ? "w-[68px]" : "w-60"}`}
			>
				{/* ── Logo ── */}
				<div className="flex h-14 items-center justify-between border-b px-3" style={{ borderColor: "var(--dashboard-border)" }}>
					<Link href="/dashboard" className={`flex items-center gap-2 ${isCollapsed ? "lg:justify-center" : ""}`}>
						{schoolData?.logo_url ? (
							<img src={schoolData.logo_url} alt={schoolData.school_name || "Logo"} className="h-8 w-8 shrink-0 rounded-lg object-cover" />
						) : (
							<Image src="/logo2.jpg" alt="IGYAN.AI" width={32} height={32} className="h-8 w-8 shrink-0 rounded-lg object-cover" />
						)}
						{!isCollapsed && (
							<span className="text-sm font-bold truncate" style={{ color: "var(--dashboard-heading)" }}>
								{schoolData?.school_name || "IGYAN.AI"}
							</span>
						)}
					</Link>
					<div className="flex items-center gap-1">
						<button
							onClick={() => setIsCollapsed(!isCollapsed)}
							className="hidden lg:flex rounded-md p-1 transition-colors hover:opacity-70"
							style={{ color: "var(--dashboard-muted)" }}
							title={isCollapsed ? "Expand" : "Collapse"}
						>
							<ChevronsLeft className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
						</button>
						<button onClick={() => setIsOpen(false)} className="lg:hidden rounded-md p-1" style={{ color: "var(--dashboard-muted)" }}>
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>

				{/* ── Portal label ── */}
				{!isCollapsed && (
					<div className="border-b px-3 py-2" style={{ borderColor: "var(--dashboard-border)" }}>
						<p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--dashboard-primary)" }}>{portal.title}</p>
						<p className="text-[10px]" style={{ color: "var(--dashboard-muted)" }}>{portal.subtitle}</p>
					</div>
				)}

				{/* ── Navigation ── */}
				<nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{sections.map((section, si) => (
						<div key={si}>
							{/* Section label — only shows if section has visible items (pre-filtered) */}
							{section.label && !isCollapsed && (
								<p className={`mt-4 mb-1 px-2 text-[10px] font-bold uppercase tracking-widest ${section.labelColor || "text-zinc-400"}`}>
									{section.label}
								</p>
							)}
							{section.label && isCollapsed && <div className="my-2 mx-2 border-t" style={{ borderColor: "var(--dashboard-border)" }} />}

							{/* Items — already filtered, just render */}
							{section.items.map((item) => {
								const isActive = pathname === item.href;
								const Icon = item.icon;

								return (
									<Link
										key={item.key}
										href={item.href}
										data-tour={`nav-${item.key}`}
										onClick={() => setIsOpen(false)}
										className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all ${
											isActive
												? "bg-[color-mix(in_srgb,var(--dashboard-primary)_12%,transparent)] shadow-sm"
												: "hover:bg-[color-mix(in_srgb,var(--dashboard-primary)_6%,transparent)]"
										} ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
										style={{ color: isActive ? "var(--dashboard-primary)" : "var(--dashboard-text)" }}
										title={isCollapsed ? item.name : ""}
									>
										<div className={`shrink-0 ${isCollapsed ? "lg:mx-auto" : ""}`}>
											{item.isCustomIcon ? <Icon /> : <Icon className="h-[18px] w-[18px]" />}
										</div>
										{!isCollapsed && <span className="truncate">{item.name}</span>}
										{isActive && !isCollapsed && (
											<div className="ml-auto h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--dashboard-primary)" }} />
										)}

										{/* Collapsed tooltip */}
										{isCollapsed && (
											<div className="invisible absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow transition-all group-hover:visible group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900 lg:block hidden">
												{item.name}
											</div>
										)}
									</Link>
								);
							})}
						</div>
					))}
				</nav>
			</aside>
		</>
	);
}
