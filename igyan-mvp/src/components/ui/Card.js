import Link from "next/link";

/**
 * Minimal reusable Card component.
 * Supports: default, muted, pill variants.
 */
export function Card({ children, className = "", variant = "default", ...props }) {
	const base = "rounded-2xl transition-all";
	const variants = {
		default: "dashboard-card p-6",
		muted: "dashboard-card-muted p-4 rounded-2xl",
		pill: "dashboard-pill rounded-2xl border p-4",
		ghost: "p-6",
	};
	return (
		<div className={`${base} ${variants[variant] || variants.default} ${className}`} {...props}>
			{children}
		</div>
	);
}

/**
 * Stat card for dashboard metrics.
 */
export function StatCard({ label, value, trend, icon: Icon, color = "indigo" }) {
	const colorMap = {
		indigo: { iconBg: "bg-indigo-500/10 text-indigo-500", accent: "from-indigo-500/10" },
		sky: { iconBg: "bg-sky-500/10 text-sky-500", accent: "from-sky-500/10" },
		purple: { iconBg: "bg-purple-500/10 text-purple-500", accent: "from-purple-500/10" },
		emerald: { iconBg: "bg-emerald-500/10 text-emerald-500", accent: "from-emerald-500/10" },
	};
	const c = colorMap[color] || colorMap.indigo;

	return (
		<div className="dashboard-card relative overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
			<div className={`absolute inset-0 bg-gradient-to-br ${c.accent} to-transparent opacity-60`} />
			<div className="relative flex items-start justify-between gap-3">
				<div className="space-y-1">
					<p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--dashboard-muted)" }}>{label}</p>
					<p className="text-2xl font-bold" style={{ color: "var(--dashboard-heading)" }}>{value}</p>
					<p className="text-xs" style={{ color: "var(--dashboard-muted)" }}>{trend}</p>
				</div>
				<div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.iconBg}`}>
					{Icon && <Icon className="h-5 w-5" />}
				</div>
			</div>
		</div>
	);
}

/**
 * Action card with icon, title, description, and link.
 */
export function ActionCard({ title, description, href, buttonText = "Open", icon: Icon, color = "indigo" }) {
	const colorMap = {
		indigo: "text-indigo-500",
		pink: "text-pink-500",
		purple: "text-purple-500",
		emerald: "text-emerald-500",
	};
	const iconColor = colorMap[color] || colorMap.indigo;

	return (
		<Link
			href={href}
			className="group dashboard-card flex flex-col gap-3 rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
		>
			<div className="flex items-center gap-3">
				<div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-white/70 dark:bg-white/10 ${iconColor}`}>
					{Icon && <Icon className="h-4 w-4" />}
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-semibold truncate" style={{ color: "var(--dashboard-heading)" }}>{title}</p>
					<p className="text-xs truncate" style={{ color: "var(--dashboard-muted)" }}>{description}</p>
				</div>
			</div>
			<div className="mt-auto flex items-center gap-1.5 text-xs font-semibold transition-transform group-hover:translate-x-0.5" style={{ color: "var(--dashboard-primary)" }}>
				<span>{buttonText}</span>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
					<path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
				</svg>
			</div>
		</Link>
	);
}
