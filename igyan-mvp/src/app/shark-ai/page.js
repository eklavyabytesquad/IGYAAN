import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/logo";

const differentiators = [
	{
		title: "Adaptive venture intelligence",
		description:
			"We map founders to capital partners using contextual scoring that considers sector appetite, traction signals, and portfolio synergies in real time.",
	},
	{
		title: "Investor readiness copilots",
		description:
			"Dynamic prep workspaces align pitch narratives with investor mandates, stress-test projections, and surface diligence red flags before the first call.",
	},
	{
		title: "Portfolio-grade governance",
		description:
			"Smart playbooks guide startups on compliance, KPI instrumentation, and post-deal reporting so that investors get the visibility they expect from day one.",
	},
];

const workflowStages = [
	{
		title: "Discover",
		description: "Signal-rich profiles highlight team, traction, and tech advantage for lightning-fast triage.",
	},
	{
		title: "Evaluate",
		description: "AI analysts benchmark financials and GTM benchmarks against comparable deals in seconds.",
	},
	{
		title: "Engage",
		description: "Warm introductions, scheduled touchpoints, and dealroom syncs happen inside one secure channel.",
	},
	{
		title: "Close",
		description: "Smart checklists orchestrate diligence artifacts and investor approvals without manual chasing.",
	},
];

export default function SharkAiPage() {
	return (
		<div className="bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
			<header className="relative overflow-hidden border-b border-slate-800/80">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.25),transparent_60%)]" />
				<div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 py-20 lg:flex-row lg:items-center lg:justify-between lg:py-24">
					<div className="max-w-xl space-y-6">
						<Logo variant="header" />
						<p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
							Shark AI intelligence desk
						</p>
						<h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
							Precision matchmaking between visionary founders and decisive investors.
						</h1>
						<p className="text-base text-slate-300">
							Shark AI analyses hundreds of venture signals so accelerators, syndicates, and corporate venture arms can identify, vet, and onboard the right startups faster than ever.
						</p>
						<div className="flex flex-wrap gap-3">
							<Link
								href="/contact"
								className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_rgba(14,165,233,0.55)] transition hover:bg-sky-400 hover:shadow-[0_0_35px_rgba(56,189,248,0.75)]"
							>
								Book a strategy call
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									className="h-4 w-4"
								>
									<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
								</svg>
							</Link>
							<Link
								href="/register"
								className="inline-flex items-center gap-2 rounded-full border border-slate-400/40 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-sky-400 hover:text-sky-300"
							>
								Launch founder profile
							</Link>
						</div>
					</div>
					<div className="relative w-full max-w-md lg:max-w-lg">
						<div className="absolute -inset-4 rounded-4xl bg-linear-to-br from-sky-500/60 via-blue-500/20 to-transparent blur-3xl" />
						<div className="relative overflow-hidden rounded-4xl border border-slate-700/60 bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 p-8 shadow-xl shadow-sky-500/20">
							<div className="relative mx-auto aspect-320/220 w-full max-w-[360px]">
								<Image
									src="/asset/ai-shark/shark.png"
									alt="Shark AI hero illustration"
									fill
									priority
									className="object-contain"
									sizes="(max-width: 768px) 100vw, 360px"
								/>
							</div>
							<div className="mt-6 space-y-3 text-sm text-slate-300">
								<p className="font-semibold text-white">Deal radar snapshot</p>
								<ul className="space-y-2">
									<li className="flex items-center justify-between rounded-xl bg-slate-800/60 px-3 py-2">
										<span>Consumer AI</span>
										<span className="text-sky-400">7 warm intros</span>
									</li>
									<li className="flex items-center justify-between rounded-xl bg-slate-800/60 px-3 py-2">
										<span>Climate tech</span>
										<span className="text-emerald-400">4 high-fit LPs</span>
									</li>
									<li className="flex items-center justify-between rounded-xl bg-slate-800/60 px-3 py-2">
										<span>Health stack</span>
										<span className="text-amber-300">3 diligence packs</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</header>

			<section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
				<div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
					<div className="space-y-4">
						<p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
							Why operators choose Shark AI
						</p>
						<h2 className="text-3xl font-semibold text-white">
							Built for investment teams who want to operate at shark speed without losing rigour.
						</h2>
						<p className="text-sm text-slate-300">
							By combining enriched founder intel, investor preferences, and contextual diligence, Shark AI ensures every conversation is relevant, personalised, and timely.
						</p>
					</div>
					<div className="grid gap-5 sm:grid-cols-2">
						{differentiators.map((item) => (
							<div
								key={item.title}
								className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-6 shadow-inner shadow-slate-900/50"
							>
								<h3 className="text-lg font-semibold text-white">{item.title}</h3>
								<p className="mt-3 text-sm text-slate-300">{item.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="border-t border-slate-800/70 bg-slate-950/70">
				<div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<div className="max-w-xl space-y-3">
							<p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
								Dealflow automation
							</p>
							<h2 className="text-3xl font-semibold text-white">
								One intelligent pipeline from first contact to signed term sheet.
							</h2>
							<p className="text-sm text-slate-300">
								Collaborate with your partners, analysts, and portfolio founders using structured workflows that adapt to your investment thesis.
							</p>
						</div>
						<Link
							href="/login"
							className="inline-flex items-center gap-2 rounded-full border border-slate-500/50 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-sky-400 hover:text-sky-300"
						>
							View sample workspace
						</Link>
					</div>
					<div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{workflowStages.map((stage, index) => (
							<div
								key={stage.title}
								className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/60 p-5"
							>
								<div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-500/10" />
								<div className="relative flex items-center gap-3">
									<span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/20 text-sm font-semibold text-sky-300">
										{String(index + 1).padStart(2, "0")}
									</span>
									<h3 className="text-lg font-semibold text-white">{stage.title}</h3>
								</div>
								<p className="relative mt-3 text-xs text-slate-300">{stage.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<footer className="border-t border-slate-800/70 bg-slate-950/80">
				<div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 text-center text-xs text-slate-500 sm:flex-row sm:justify-between">
					<p>
						© {new Date().getFullYear()} iGyanAI. Shark AI is a venture intelligence module built for founders and investors.
					</p>
					<div className="flex items-center gap-4">
						<Link href="/contact" className="hover:text-sky-300">
							Connect with us
						</Link>
						<Link href="/features" className="hover:text-sky-300">
							Explore platform
						</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}
