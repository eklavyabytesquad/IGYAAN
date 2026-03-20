import Link from "next/link";

/**
 * Minimal Button component.
 * Variants: primary, secondary, ghost.
 */
export function Button({ children, href, variant = "primary", className = "", ...props }) {
	const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all";
	const variants = {
		primary: "dashboard-button hover:shadow-md",
		secondary: "border px-4 py-2 hover:opacity-80",
		ghost: "hover:opacity-70",
	};
	const cls = `${base} ${variants[variant] || variants.primary} ${className}`;

	if (href) {
		return <Link href={href} className={cls} {...props}>{children}</Link>;
	}
	return <button className={cls} {...props}>{children}</button>;
}
