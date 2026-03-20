/**
 * Badge / Pill component for tags.
 */
export function Badge({ children, className = "" }) {
	return (
		<span className={`dashboard-pill rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${className}`}>
			{children}
		</span>
	);
}
