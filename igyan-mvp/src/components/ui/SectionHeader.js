/**
 * Section header for dashboard sections.
 */
export function SectionHeader({ title, subtitle, action }) {
	return (
		<div className="mb-5 flex items-center justify-between">
			<div>
				<h2 className="text-base font-semibold" style={{ color: "var(--dashboard-heading)" }}>{title}</h2>
				{subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--dashboard-muted)" }}>{subtitle}</p>}
			</div>
			{action && <div>{action}</div>}
		</div>
	);
}
