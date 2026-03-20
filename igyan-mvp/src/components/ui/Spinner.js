/**
 * Spinner / loading indicator.
 */
export function Spinner({ text = "Loading..." }) {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
				<p className="mt-3 text-sm" style={{ color: "var(--dashboard-muted)" }}>{text}</p>
			</div>
		</div>
	);
}
