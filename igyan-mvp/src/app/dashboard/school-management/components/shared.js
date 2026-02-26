"use client";

// ─── Shared Styles ──────────────────────────────────────────
export const inputClass =
	"w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500";
export const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5";
export const cardClass =
	"rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900";
export const btnPrimary =
	"inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-600 hover:to-indigo-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed";
export const btnSecondary =
	"inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700";
export const btnDanger =
	"inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20";
export const btnGhost =
	"inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20";
export const thClass = "px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400";
export const tdClass = "px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300";
export const tdBold = "px-6 py-4 text-sm font-medium text-zinc-900 dark:text-white";
export const emptyClass = "px-6 py-12 text-center text-sm text-zinc-400 dark:text-zinc-500";
export const alertSuccess =
	"mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300";
export const alertError =
	"mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300";

export const TABS = [
	{ id: "sessions", label: "Sessions", icon: "📅" },
	{ id: "subjects", label: "Subjects", icon: "📚" },
	{ id: "classes", label: "Classes", icon: "🏫" },
	{ id: "add-students", label: "Add Students", icon: "➕" },
	{ id: "parents", label: "Parents", icon: "👪" },
	{ id: "students", label: "Enrollment", icon: "🎓" },
	{ id: "faculty-assign", label: "Faculty Assign", icon: "👨‍🏫" },
	{ id: "student-attendance", label: "Student Att.", icon: "✅" },
	{ id: "faculty-attendance", label: "Faculty Att.", icon: "📋" },
	{ id: "transfers", label: "Transfers", icon: "🔄" },
];

// ─── MODAL WRAPPER ──────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = "max-w-2xl" }) {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
			<div className="absolute inset-0 bg-black/40" />
			<div className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900`} onClick={(e) => e.stopPropagation()}>
				<div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
					<h2 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h2>
					<button onClick={onClose} className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">
						<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
					</button>
				</div>
				{children}
			</div>
		</div>
	);
}

// ─── BADGE ──────────────────────────────────────────────────
export function Badge({ color = "zinc", children }) {
	const colors = {
		green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-400/20",
		red: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-400/20",
		blue: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-400/20",
		yellow: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-400/20",
		indigo: "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-900/20 dark:text-indigo-400 dark:ring-indigo-400/20",
		purple: "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900/20 dark:text-purple-400 dark:ring-purple-400/20",
		zinc: "bg-zinc-100 text-zinc-600 ring-zinc-500/10 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-400/20",
	};
	return (
		<span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${colors[color] || colors.zinc}`}>
			{children}
		</span>
	);
}

// ─── STAT CARD ──────────────────────────────────────────────
export function StatCard({ icon, label, value, color = "indigo" }) {
	const isWhite = color === "white";
	const iconColors = {
		indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
		emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
		purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
		sky: "bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
		amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
		white: "bg-white/20 text-white",
	};
	return (
		<div className={isWhite
			? "rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-4 min-w-[130px]"
			: "rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
		}>
			<div className="flex items-center gap-3">
				<div className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${iconColors[color] || iconColors.indigo}`}>
					{icon}
				</div>
				<div>
					<p className={isWhite ? "text-2xl font-bold text-white" : "text-2xl font-bold text-zinc-900 dark:text-white"}>{value}</p>
					<p className={isWhite ? "text-xs text-indigo-100" : "text-sm text-zinc-500 dark:text-zinc-400"}>{label}</p>
				</div>
			</div>
		</div>
	);
}
