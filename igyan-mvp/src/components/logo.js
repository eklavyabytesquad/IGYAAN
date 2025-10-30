import Image from "next/image";

function cn(...classes) {
	return classes.filter(Boolean).join(" ");
}

const variantClasses = {
	hero: "w-44 sm:w-56 lg:w-64",
	nav: "w-12 sm:w-14",
	footer: "w-14",
	header: "w-12 sm:w-14",
	sidebar: "w-11",
	card: "w-16",
	compact: "w-10",
};

export default function Logo({
	variant = "header",
	className = "",
	imageClassName = "",
	priority = false,
	alt = "iGyan.AI logo",
}) {
	const sizeClass = variantClasses[variant] ?? variantClasses.header;

	return (
		<span className={cn("inline-flex items-center", className)}>
			<Image
				src="/asset/logo1.png"
				alt={alt}
				width={512}
				height={512}
				priority={priority}
				className={cn("h-auto object-contain", sizeClass, imageClassName)}
			/>
			<span className="sr-only">iGyan.AI · Talent in Motion</span>
		</span>
	);
}
