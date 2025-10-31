"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Logo from "@/components/logo";

const incubators = [
	{
		name: "Startup India (Main Portal)",
		region: "National",
		urls: ["https://www.startupindia.gov.in/"],
	},
	{
		name: "Atal Innovation Mission (AIM) Portal",
		region: "National",
		urls: ["https://aim.gov.in/atal-incubation-centres.php"],
	},
	{
		name: "MSME Incubation Scheme Portal",
		region: "National",
		urls: ["https://my.msme.gov.in/inc/"],
	},
	{
		name: "MeitY Startup Hub (MSH) Portal",
		region: "National",
		urls: ["https://msh.meity.gov.in/"],
	},
	{
		name: "Software Tech Parks of India (STPI)",
		region: "National",
		urls: ["https://stpi.in/en/instructions-applying-online"],
	},
	{
		name: "NIDHI (DST) Incubator Directory",
		region: "National",
		urls: ["https://www.indiascienceandtechnology.gov.in/listingpage/technology-incubators"],
	},
	{
		name: "Startup Andhra Pradesh",
		region: "Andhra Pradesh",
		urls: ["https://startupandhrapradesh.gov.in/"],
	},
	{
		name: "Startup Arunachal Pradesh",
		region: "Arunachal Pradesh",
		urls: ["https://startuparunachal.com/"],
	},
	{
		name: "Startup Assam",
		region: "Assam",
		urls: ["https://startup.assam.gov.in/"],
	},
	{
		name: "Startup Bihar",
		region: "Bihar",
		urls: ["https://startup.bihar.gov.in/"],
	},
	{
		name: "StartinUP (Uttar Pradesh)",
		region: "Uttar Pradesh",
		urls: ["https://startinup.up.gov.in/"],
	},
	{
		name: "Startup Chhattisgarh",
		region: "Chhattisgarh",
		urls: ["https://startup.cg.gov.in/"],
	},
	{
		name: "Startup Goa",
		region: "Goa",
		urls: ["https://www.startup.goa.gov.in/"],
	},
	{
		name: "Startup Gujarat",
		region: "Gujarat",
		urls: ["https://startup.gujarat.gov.in/"],
	},
	{
		name: "Startup Haryana",
		region: "Haryana",
		urls: ["https://startupharyana.gov.in/"],
	},
	{
		name: "Startup Himachal",
		region: "Himachal Pradesh",
		urls: ["https://startuphimachal.hp.gov.in/"],
	},
	{
		name: "Startup Jharkhand",
		region: "Jharkhand",
		urls: ["https://startup.jharkhand.gov.in/"],
	},
	{
		name: "Startup Karnataka",
		region: "Karnataka",
		urls: ["https://startup.karnataka.gov.in/"],
	},
	{
		name: "Kerala Startup Mission (KSUM)",
		region: "Kerala",
		urls: ["https://startupmission.kerala.gov.in/"],
	},
	{
		name: "Startup Madhya Pradesh",
		region: "Madhya Pradesh",
		urls: ["https://mpstartup.gov.in/"],
	},
	{
		name: "Startup Maharashtra",
		region: "Maharashtra",
		urls: ["https://msins.in/"],
	},
	{
		name: "Startup Manipur",
		region: "Manipur",
		urls: ["https://startupmanipur.in/"],
	},
	{
		name: "Startup Meghalaya",
		region: "Meghalaya",
		urls: ["https://startupmeghalaya.gov.in/"],
	},
	{
		name: "Startup Mizoram",
		region: "Mizoram",
		urls: ["https://startupmizoram.gov.in/"],
	},
	{
		name: "Startup Nagaland",
		region: "Nagaland",
		urls: ["https://startupnagaland.gov.in/"],
	},
	{
		name: "Startup Odisha",
		region: "Odisha",
		urls: ["https://startupodisha.gov.in/"],
	},
	{
		name: "Startup Punjab",
		region: "Punjab",
		urls: ["https://startup.punjab.gov.in/"],
	},
	{
		name: "Startup Rajasthan (iStart)",
		region: "Rajasthan",
		urls: ["https://istart.rajasthan.gov.in/"],
	},
	{
		name: "Startup Sikkim",
		region: "Sikkim",
		urls: ["https://startupsikkim.gov.in/"],
	},
	{
		name: "Startup Tamil Nadu (TANSIM)",
		region: "Tamil Nadu",
		urls: ["https://startuptn.in/"],
	},
	{
		name: "Startup Telangana (T-Hub)",
		region: "Telangana",
		urls: ["https://t-hub.co/"],
	},
	{
		name: "Startup Tripura",
		region: "Tripura",
		urls: ["https://startup.tripura.gov.in/"],
	},
	{
		name: "Startup Uttarakhand",
		region: "Uttarakhand",
		urls: ["https://startup.uk.gov.in/"],
	},
	{
		name: "Startup West Bengal",
		region: "West Bengal",
		urls: ["https://startup.wb.gov.in/"],
	},
	{
		name: "J&K Entrepreneurship Dev. Inst.",
		region: "Jammu & Kashmir",
		urls: ["https://www.jkedi.org/"],
	},
	{
		name: "SINE (IIT Bombay)",
		region: "Maharashtra",
		urls: ["https://www.sineiitb.org/"],
	},
	{
		name: "FITT (IIT Delhi)",
		region: "Delhi",
		urls: ["https://fitt.accubate.app/ext/form/3403/1/apply"],
	},
	{
		name: "IIT Madras Incubation Cell",
		region: "Tamil Nadu",
		urls: ["https://incubation.iitm.ac.in/"],
	},
	{
		name: "SIIC (IIT Kanpur)",
		region: "Uttar Pradesh",
		urls: ["https://siicincubator.com/"],
	},
	{
		name: "NSRCEL (IIM Bangalore)",
		region: "Karnataka",
		urls: ["https://nsrcel.org/programs/"],
	},
	{
		name: "IIMA Ventures (CIIE)",
		region: "Gujarat",
		urls: ["https://iimaventures.com/incubation/"],
	},
	{
		name: "SID (IISc Bangalore)",
		region: "Karnataka",
		urls: ["https://sid.iisc.ac.in/"],
	},
	{
		name: "i-TIC (IIT Hyderabad)",
		region: "Telangana",
		urls: ["https://itic.iith.ac.in/"],
	},
	{
		name: "TIDES (IIT Roorkee)",
		region: "Uttarakhand",
		urls: ["https://tides.iitr.ac.in/"],
	},
	{
		name: "Venture Center (NCL Pune)",
		region: "Maharashtra",
		urls: ["https://www.venturecenter.co.in/"],
	},
	{
		name: "iCreate (Ahmedabad)",
		region: "Gujarat",
		urls: ["https://icreate.org.in/"],
	},
	{
		name: "T-Hub (Hyderabad)",
		region: "Telangana",
		urls: ["https://t-hub.co/"],
	},
	{
		name: "Startup Village (SV.co)",
		region: "Kerala",
		urls: ["https://sv.co/"],
	},
	{
		name: "CrAdLE (EDII Ahmedabad)",
		region: "Gujarat",
		urls: ["https://www.cradle-edii.in/"],
	},
	{
		name: "IKP EDEN (Bangalore)",
		region: "Karnataka",
		urls: ["https://www.ikpeden.com/"],
	},
	{
		name: "GFEE-iCreate (Ahmedabad)",
		region: "Gujarat",
		urls: ["https://www.icreate.org.in/"],
	},
	{
		name: "Villgro Innovations",
		region: "Tamil Nadu",
		urls: ["https://villgro.org/"],
	},
	{
		name: "Kerala Startup Mission - Incubation",
		region: "Kerala",
		urls: ["https://startupmission.kerala.gov.in/"],
	},
	{
		name: "Startup Oasis (Rajasthan)",
		region: "Rajasthan",
		urls: ["https://www.startupoasis.in/"],
	},
	{
		name: "PIED Society (BITS Pilani)",
		region: "Rajasthan",
		urls: ["https://www.piedsociety.org/"],
	},
	{
		name: "IIT Ropar TBIF",
		region: "Punjab",
		urls: ["https://www.tbifiitrpr.org/"],
	},
	{
		name: "FIED (IIM Kashipur)",
		region: "Uttarakhand",
		urls: ["https://fied.in/"],
	},
	{
		name: "ASPIRE-TBI (University of Hyderabad)",
		region: "Telangana",
		urls: ["https://www.tbi.uohyd.ac.in/"],
	},
	{
		name: "DLabs (ISB Hyderabad)",
		region: "Telangana",
		urls: ["https://www.isbdlabs.org/"],
	},
	{
		name: "IIM Udaipur Incubation Centre",
		region: "Rajasthan",
		urls: ["https://iimuic.org/"],
	},
	{
		name: "IIM Calcutta Innovation Park",
		region: "West Bengal",
		urls: ["https://www.iimcip.org/"],
	},
	{
		name: "STEP-IIT Kharagpur",
		region: "West Bengal",
		urls: ["https://www.stepiitkgp.org/"],
	},
	{
		name: "NITK STEP (NIT Surathkal)",
		region: "Karnataka",
		urls: ["https://step.nitk.ac.in/"],
	},
	{
		name: "MIT TBI Pune",
		region: "Maharashtra",
		urls: ["https://www.mittbi.org/"],
	},
	{
		name: "RIIDL (Somaiya)",
		region: "Maharashtra",
		urls: ["https://riidl.org/"],
	},
	{
		name: "KIIT Technology Business Incubator",
		region: "Odisha",
		urls: ["https://www.kiitincubator.in/"],
	},
	{
		name: "FTBI (NIT Rourkela)",
		region: "Odisha",
		urls: ["https://www.ftbi-nitrkl.org/"],
	},
	{
		name: "Startup Odisha Incubation Hub",
		region: "Odisha",
		urls: ["https://startupodisha.gov.in/"],
	},
	{
		name: "Deshpande Startups (Bangalore)",
		region: "Karnataka",
		urls: ["https://www.deshpandestartups.org/"],
	},
	{
		name: "Manipal University TBI",
		region: "Karnataka",
		urls: ["https://www.mutbimanipal.org/"],
	},
	{
		name: "Jain University Incubation Centre",
		region: "Karnataka",
		urls: ["https://www.juincubator.com/"],
	},
	{
		name: "ARTILAB Foundation (Bangalore)",
		region: "Karnataka",
		urls: ["https://artilab.org/"],
	},
	{
		name: "Comcubator (MICA Ahmedabad)",
		region: "Gujarat",
		urls: ["https://www.mica.ac.in/"],
	},
	{
		name: "CU-TBI (Chandigarh University)",
		region: "Punjab",
		urls: ["https://www.cuchd.in/entrepreneurship/"],
	},
	{
		name: "TBI-NIT Jalandhar",
		region: "Punjab",
		urls: ["https://www.nitj.ac.in/tbi/"],
	},
	{
		name: "IIT Mandi Catalyst",
		region: "Himachal Pradesh",
		urls: ["https://www.iitmandicatalyst.in/"],
	},
	{
		name: "SCTIMST-TIMed (Kerala)",
		region: "Kerala",
		urls: ["https://www.timed.org.in/"],
	},
	{
		name: "Amrita TBI (Kerala)",
		region: "Kerala",
		urls: ["https://amritatbi.com/"],
	},
	{
		name: "PSG STEP (Coimbatore)",
		region: "Tamil Nadu",
		urls: ["https://www.psgstep.org/"],
	},
	{
		name: "TREC STEP (NIT Trichy)",
		region: "Tamil Nadu",
		urls: ["https://www.trecstep.com/"],
	},
	{
		name: "Indigram Labs Foundation (Delhi)",
		region: "Delhi",
		urls: ["https://indigramlabs.org/"],
	},
	{
		name: "IGDTUW Anveshan Foundation (Delhi)",
		region: "Delhi",
		urls: ["https://www.anveshanfoundation.org/"],
	},
	{
		name: "Shri Ram Institute TBI (Delhi)",
		region: "Delhi",
		urls: ["https://www.sri-tbi.org/"],
	},
	{
		name: "AIC GGSIPU Foundation Delhi",
		region: "Delhi",
		urls: ["https://www.aic-ggsipu.org/"],
	},
	{
		name: "IAN Mentoring and Incubation Services (Delhi)",
		region: "Delhi",
		urls: ["https://www.indianangelnetwork.com/"],
	},
	{
		name: "IIT BHU Innovation Centre",
		region: "Uttar Pradesh",
		urls: ["https://www.aic-imbhu.ac.in/", "https://i3f-iitbhu.org/"],
	},
	{
		name: "AIC-Shiv Nadar University (Chennai)",
		region: "Tamil Nadu",
		urls: ["https://aic.snu.edu.in/"],
	},
	{
		name: "Mazumdar Shaw Medical Foundation TBI",
		region: "Karnataka",
		urls: ["https://www.tbi.ms-mf.org/"],
	},
	{
		name: "DERBI Foundation (Bangalore)",
		region: "Karnataka",
		urls: ["https://derbifoundation.com/"],
	},
	{
		name: "Leaf GLS University (Ahmedabad)",
		region: "Gujarat",
		urls: ["https://www.glsleaf.in/"],
	},
	{
		name: "GUSEC (Gujarat University)",
		region: "Gujarat",
		urls: ["https://gusec.edu.in/"],
	},
	{
		name: "SINED (NDRI Karnal)",
		region: "Haryana",
		urls: ["https://www.ndritbi.com/"],
	},
	{
		name: "IIIM Technology Business Incubator (Jammu)",
		region: "Jammu & Kashmir",
		urls: ["https://www.iiimtbi.com/"],
	},
	{
		name: "IIT Gandhinagar Research Park",
		region: "Gujarat",
		urls: ["https://iitgnrp.com/"],
	},
	{
		name: "TBI-IISER Mohali",
		region: "Punjab",
		urls: ["https://www.iisermohali.ac.in/tbi/"],
	},
	{
		name: "Startup Village Incubation (Kerala)",
		region: "Kerala",
		urls: ["https://www.startupsvalley.in/"],
	},
];

const priorityRegions = ["National"];

const sortRegions = (a, b) => {
	const aPriority = priorityRegions.indexOf(a);
	const bPriority = priorityRegions.indexOf(b);
	if (aPriority === -1 && bPriority === -1) {
		return a.localeCompare(b);
	}
	if (aPriority === -1) {
		return 1;
	}
	if (bPriority === -1) {
		return -1;
	}
	return aPriority - bPriority;
};

export default function IncubationHubPage() {
	const [searchTerm, setSearchTerm] = useState("");

	const filteredIncubators = useMemo(() => {
		const query = searchTerm.trim().toLowerCase();
		if (!query) {
			return incubators;
		}

		return incubators.filter((incubator) => {
			return (
				incubator.name.toLowerCase().includes(query) ||
				incubator.region.toLowerCase().includes(query)
			);
		});
	}, [searchTerm]);

	const groupedIncubators = useMemo(() => {
		const buckets = new Map();

		filteredIncubators.forEach((incubator) => {
			const key = incubator.region;
			if (!buckets.has(key)) {
				buckets.set(key, []);
			}
			buckets.get(key).push(incubator);
		});

		return Array.from(buckets.entries())
			.map(([region, items]) => [region, items.sort((a, b) => a.name.localeCompare(b.name))])
			.sort((a, b) => sortRegions(a[0], b[0]));
	}, [filteredIncubators]);

	return (
		<div className="space-y-10 p-6 lg:p-10">
			<header className="space-y-3">
				<Logo variant="header" />
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">Incubation Hub</h1>
						<p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
							Explore national and state incubation programs, accelerators, and institute-run hubs to fast-track your startup journey.
						</p>
					</div>
					<div className="rounded-2xl border border-sky-200 bg-white/80 px-5 py-3 text-sm font-semibold text-sky-600 shadow-sm dark:border-sky-500/40 dark:bg-zinc-900/80 dark:text-sky-300">
						{filteredIncubators.length} programs listed
					</div>
				</div>
			</header>

			<section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="space-y-1">
						<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Find the right incubator</h2>
						<p className="text-xs text-zinc-500 dark:text-zinc-400">
							Filter by state or search by program name to surface relevant opportunities.
						</p>
					</div>
					<label className="relative flex w-full items-center md:w-80">
						<span className="pointer-events-none absolute left-3 text-zinc-400">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-4 w-4"
							>
								<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.25 5.25a7.5 7.5 0 0011.4 11.4z" />
							</svg>
						</span>
						<input
							type="search"
							className="w-full rounded-xl border border-zinc-200 bg-white/70 py-2 pl-10 pr-3 text-sm text-zinc-800 transition focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-100 dark:focus:border-sky-500 dark:focus:ring-sky-500/40"
							placeholder="Search incubators or states"
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
						/>
					</label>
				</div>
			</section>

			{groupedIncubators.length === 0 ? (
				<div className="rounded-3xl border border-dashed border-zinc-300 bg-white/70 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-400">
					No incubators match your search. Try a different keyword or clear the filter.
				</div>
			) : (
				<div className="space-y-8">
					{groupedIncubators.map(([region, items]) => (
						<section key={region} className="space-y-4">
							<header className="flex flex-wrap items-center justify-between gap-4">
								<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{region}</h3>
								<span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
									{items.length} program{items.length > 1 ? "s" : ""}
								</span>
							</header>
							<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
								{items.map((incubator) => (
									<article
										key={incubator.name}
										className="rounded-2xl border border-sky-100 bg-white/85 p-4 shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg dark:border-sky-500/20 dark:bg-zinc-900/80"
									>
										<div className="flex flex-col gap-3">
											<div>
												<h4 className="text-base font-semibold text-zinc-900 dark:text-white">
													{incubator.name}
												</h4>
												<p className="text-xs text-zinc-500 dark:text-zinc-400">{region}</p>
											</div>
											<div className="flex flex-wrap gap-2">
												{incubator.urls.map((url, index) => (
													<Link
														key={`${incubator.name}-link-${index}`}
														href={url}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center gap-2 rounded-full border border-sky-200 px-3 py-1.5 text-xs font-semibold text-sky-600 transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 dark:border-sky-500/30 dark:text-sky-300 dark:hover:border-sky-400 dark:hover:bg-sky-500/10"
													>
														<span>Visit portal</span>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="1.5"
															className="h-3.5 w-3.5"
														>
															<path strokeLinecap="round" strokeLinejoin="round" d="M7.5 16.5L16.5 7.5M16.5 7.5H8.25M16.5 7.5v8.25" />
														</svg>
													</Link>
												))}
											</div>
										</div>
									</article>
								))}
							</div>
						</section>
					))}
				</div>
			)}
		</div>
	);
}
