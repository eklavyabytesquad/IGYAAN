"use client";

import { ArrowRight, Building2, ChevronDown, GraduationCap, Menu, UserRound, UsersRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const primaryLinks = [{ href: "/about", label: "About Us" }];

const featureGroups = [
  { title: "For Students", subtitle: "Personalized learning & growth", Icon: UserRound, links: ["Personalized Paths", "Career Mapping", "Venture Ready"] },
  { title: "For Teachers", subtitle: "Automation & mentoring tools", Icon: GraduationCap, links: ["Lesson Planning", "Admin Automation", "Mentor Bots"] },
  { title: "For Parents", subtitle: "Real-time progress insights", Icon: UsersRound, links: ["Progress Insights", "Growth Tracking", "Communication"] },
  { title: "For Institutions", subtitle: "Data-driven management", Icon: Building2, links: ["Campus Management", "Global Collaboration", "Resource Optimization"] },
];

const secondaryLinks = [
  { href: "/contact", label: "Contact" },
  { href: "/shark-ai", label: "AI Shark" },
];

const insightsLinks = [
  { href: "/insights/blogs", label: "Blog of Insights" },
  { href: "/insights/industry", label: "Industry Insights" },
];

const bookDemoUrl = "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1S_aLW5PlZiAQ5dLhd4pbPQCGd9EP40WSYoSglUe0KeCgGvUJpPRjf4KJwje3tdRs7elWCYI1-";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const featuresRef = useRef(null);
  const insightsRef = useRef(null);

  useEffect(() => {
    const closeMenu = window.setTimeout(() => setMobileOpen(false), 0);
    return () => window.clearTimeout(closeMenu);
  }, [pathname]);
  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (featuresRef.current && !featuresRef.current.contains(event.target)) setFeaturesOpen(false);
      if (insightsRef.current && !insightsRef.current.contains(event.target)) setInsightsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const isInsightsActive = pathname?.startsWith("/insights");
  const navLinkClass = (href) => `transition-colors hover:text-[#064bb2] ${pathname === href ? "font-semibold text-[#064bb2]" : "text-slate-500"}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white transition-colors duration-300">
      <div className="flex h-10 w-full items-center justify-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 text-center text-xs font-semibold text-white sm:text-sm">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
        India&apos;s AI-Native Operating System for Schools &amp; Colleges
        <a href={bookDemoUrl} target="_blank" rel="noopener noreferrer" className="ml-3 whitespace-nowrap font-bold underline decoration-2 underline-offset-3 transition-opacity hover:opacity-80">Book a Free Demo →</a>
      </div>

      <nav className="mx-auto flex h-20 w-full max-w-[1200px] items-center justify-between px-5 sm:px-8 lg:px-0">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="IGYAN AI home">
          <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-[#eaf4ff] ring-1 ring-[#064bb2]/10">
            <Image src="/asset/igyan-ai-mark.png" alt="IGYAN AI logo" width={48} height={48} className="h-12 w-12 object-contain drop-shadow-[0_1px_1px_rgba(6,75,178,0.35)]" priority />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-[#064bb2] sm:text-2xl">IGYAN AI</span>
        </Link>

        <div className="hidden items-center gap-8 text-base lg:flex">
          <div ref={featuresRef} className="relative">
            <button type="button" onClick={() => { setFeaturesOpen((open) => !open); setInsightsOpen(false); }} className={`flex items-center gap-1 transition-colors hover:text-[#064bb2] ${pathname === "/features" ? "font-semibold text-[#064bb2]" : "text-slate-500"}`} aria-expanded={featuresOpen}>
              Features <ChevronDown className={`h-4 w-4 transition-transform ${featuresOpen ? "rotate-180" : ""}`} />
            </button>
            {featuresOpen && <div className="absolute left-1/2 top-full mt-3 w-[760px] -translate-x-[38%] overflow-hidden rounded-[1.25rem] border border-slate-100 bg-white shadow-xl shadow-slate-900/15">
              <div className="grid gap-x-10 gap-y-6 px-7 py-7 md:grid-cols-2">{featureGroups.map(({ title, subtitle, Icon, links }) => <section key={title} className="flex gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#064bb2]"><Icon className="h-6 w-6" aria-hidden="true" /></div><div><h2 className="text-base font-extrabold text-[#064bb2]">{title}</h2><p className="mb-2 text-xs font-semibold tracking-wide text-slate-500">{subtitle}</p><div className="space-y-1.5">{links.map((link) => <Link key={link} href="/features" onClick={() => setFeaturesOpen(false)} className="block text-sm text-slate-700 transition hover:text-[#064bb2]">{link}</Link>)}</div></div></section>)}</div>
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-7 py-3"><p className="text-xs font-medium text-slate-500">Explore the full potential of AI-native education.</p><Link href="/features" onClick={() => setFeaturesOpen(false)} className="inline-flex items-center gap-2 text-sm font-bold text-[#064bb2] transition hover:text-[#003d91]">View all features <ArrowRight className="h-4 w-4" /></Link></div>
            </div>}
          </div>
          {primaryLinks.map(({ href, label }) => <Link key={href} href={href} className={navLinkClass(href)}>{label}</Link>)}
          <div ref={insightsRef} className="relative">
            <button type="button" onClick={() => { setInsightsOpen((open) => !open); setFeaturesOpen(false); }} className={`flex items-center gap-1 transition-colors hover:text-[#064bb2] ${isInsightsActive ? "font-semibold text-[#064bb2]" : "text-slate-500"}`} aria-expanded={insightsOpen}>
              Insights <ChevronDown className={`h-4 w-4 transition-transform ${insightsOpen ? "rotate-180" : ""}`} />
            </button>
            {insightsOpen && <div className="absolute left-1/2 top-full mt-4 w-60 -translate-x-1/2 rounded-xl border border-slate-100 bg-white p-2 shadow-xl"><div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">Insights</div>{insightsLinks.map(({ href, label }) => <Link key={href} href={href} onClick={() => setInsightsOpen(false)} className={`block rounded-lg px-3 py-2.5 text-sm transition ${pathname === href ? "bg-indigo-50 font-semibold text-[#064bb2]" : "text-slate-600 hover:bg-slate-50 hover:text-[#064bb2]"}`}>{label}</Link>)}</div>}
          </div>
          {secondaryLinks.map(({ href, label }) => <Link key={href} href={href} className={navLinkClass(href)}>{label}</Link>)}
        </div>

        <div className="hidden items-center gap-7 text-base lg:flex"><Link href="/login" className="font-semibold text-[#064bb2] transition hover:text-[#003d91]">Log in</Link><a href={bookDemoUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#064bb2] px-6 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#003d91]">Book Demo</a></div>
        <button type="button" onClick={() => setMobileOpen((open) => !open)} className="rounded-lg p-2 text-[#064bb2] lg:hidden" aria-expanded={mobileOpen} aria-label="Toggle navigation">{mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
      </nav>

      {mobileOpen && <div className="border-t border-slate-100 bg-white px-5 py-5 lg:hidden"><div className="mx-auto flex max-w-[1200px] flex-col gap-2 text-base"><Link href="/features" className={`rounded-lg px-3 py-2.5 ${navLinkClass("/features")}`}>Features</Link>{primaryLinks.map(({ href, label }) => <Link key={href} href={href} className={`rounded-lg px-3 py-2.5 ${navLinkClass(href)}`}>{label}</Link>)}<div className="rounded-lg border border-slate-100 px-3 py-2.5"><span className="text-sm font-semibold text-slate-500">Insights</span>{insightsLinks.map(({ href, label }) => <Link key={href} href={href} className={`mt-1 block rounded-lg px-2 py-2 text-sm ${navLinkClass(href)}`}>{label}</Link>)}</div>{secondaryLinks.map(({ href, label }) => <Link key={href} href={href} className={`rounded-lg px-3 py-2.5 ${navLinkClass(href)}`}>{label}</Link>)}<div className="mt-3 flex gap-3"><Link href="/login" className="flex-1 rounded-full border border-[#064bb2] px-4 py-3 text-center font-semibold text-[#064bb2]">Log in</Link><a href={bookDemoUrl} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-full bg-[#064bb2] px-4 py-3 text-center font-semibold text-white">Book Demo</a></div></div></div>}
    </header>
  );
}
