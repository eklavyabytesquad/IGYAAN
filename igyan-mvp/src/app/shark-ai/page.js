"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Mic } from "lucide-react";
import FloatingContactActions from "@/components/floating-contact-actions";

const features = [
  { icon: "◉", title: "Real-Time Pitch Feedback", body: "The AI analyzes your voice tone, pacing, and vocabulary to provide immediate coaching as you deliver your pitch live.", footer: "✓ Sentiment Analysis Active" },
  { icon: "↗", title: "Capital Readiness Score", body: "A data-driven score that evaluates your business model against institutional funding benchmarks and investor expectations.", footer: "score" },
  { icon: "⌘", title: "Venture Studio Integration", body: "Your pitch results automatically populate your Venture Studio dashboard, triggering recommended next steps for your startup.", footer: "avatars" },
];

export default function SharkAiPage() {
  const [score, setScore] = useState(77);

  useEffect(() => {
    const interval = window.setInterval(() => setScore(Math.floor(Math.random() * 14) + 72), 3000);
    return () => window.clearInterval(interval);
  }, []);

  const dashOffset = 502 - (502 * score) / 100;

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#3b1595] via-[#2f1078] to-[#0a051c] px-6 py-20 text-white sm:px-10 md:py-24">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#a5b4fc_0,transparent_30%),radial-gradient(circle_at_80%_70%,#67e8f9_0,transparent_25%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
          <div>
            <Image src="/asset/ai-shark/sharkicon.png" alt="AI Shark icon" width={128} height={128} className="mb-6 h-28 w-28 animate-float object-contain drop-shadow-xl" priority />
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Pitch to the Shark.<br /><span className="text-cyan-200">Launch Your Legacy.</span></h1>
            <p className="max-w-lg text-lg leading-relaxed text-indigo-100">The Sudarshan AI Shark is your 24/7 venture mentor. Get instant feedback on your business model, market fit, and capital readiness.</p>
            <div className="mt-10 flex flex-wrap gap-4"><Link href="/login?error=login_required" className="rounded-full bg-[#064bb2] px-8 py-4 font-bold shadow-md transition hover:-translate-y-0.5 hover:bg-[#003d91]">Start Your Pitch →</Link><Link href="/success-stories" className="rounded-full border border-white/50 px-8 py-4 font-bold transition hover:bg-white/10">View Success Stories</Link></div>
          </div>
          <div className="relative"><div className="absolute -inset-4 rounded-full bg-cyan-300/20 blur-3xl" /><div className="relative rounded-3xl border-4 border-white/20 bg-white/10 p-5 shadow-2xl"><div className="relative h-[390px] overflow-hidden rounded-2xl sm:h-[480px]"><Image src="/asset/ai-shark/shark.png" alt="AI Shark venture mentor" fill priority className="object-contain" sizes="(max-width: 768px) 100vw, 550px" /></div></div></div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 sm:px-10 md:py-28"><div className="mx-auto max-w-6xl"><div className="mx-auto mb-16 max-w-2xl text-center"><h2 className="mb-4 text-3xl font-bold tracking-tight text-[#063e91] sm:text-4xl">Precision Mentorship</h2><p className="leading-relaxed text-slate-600">Leveraging deep-learning models trained on thousands of successful institutional pitches to give you an unfair advantage.</p></div><div className="grid gap-6 md:grid-cols-3">{features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}</div></div></section>

      <section className="bg-slate-50 px-6 py-20 sm:px-10 md:py-28"><div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-7 shadow-xl sm:p-10"><div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" /><div className="relative grid items-center gap-10 lg:grid-cols-[1fr_480px]"><div><h2 className="mb-6 text-3xl font-bold tracking-tight text-[#063e91] sm:text-4xl">Experience the<br /><span className="text-[#064bb2]">Shark Interface</span></h2><p className="mb-8 text-lg leading-relaxed text-slate-600">Our multimodal engine hears every nuance. It does not just listen; it understands the &quot;why&quot; behind your business decisions.</p><ul className="space-y-4 text-slate-700">{["Dynamic tone calibration", "Competitive landscape mapping", "Real-time objection handling drills"].map((item) => <li key={item} className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 font-bold text-[#064bb2]">✓</span>{item}</li>)}</ul></div><ScorePanel score={score} dashOffset={dashOffset} /></div></div></section>

      <section className="bg-white px-6 py-20 sm:px-10 md:py-28"><div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 px-8 py-16 text-center text-white shadow-2xl sm:px-16"><div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:40px_40px]" /><div className="relative"><h2 className="mb-5 text-3xl font-bold tracking-tight sm:text-4xl">Bring AI Shark to Your Campus</h2><p className="mx-auto max-w-2xl text-lg leading-relaxed text-indigo-100">Empower your students with the world&apos;s most advanced venture coaching tool. Join 50+ institutions fostering the next generation of founders.</p><div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"><Link href="/contact" className="rounded-full bg-[#064bb2] px-10 py-4 font-bold shadow-md transition hover:scale-[1.02] hover:bg-[#003d91]">Institutional Inquiry</Link><Link href="/contact" className="rounded-full border border-white/50 px-10 py-4 font-bold transition hover:bg-white/10">Download Brochure</Link></div></div></div></section>

      <FloatingContactActions />
    </>
  );
}

function FeatureCard({ icon, title, body, footer }) {
  return <article className="group flex min-h-[330px] flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"><div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-[#064bb2] transition group-hover:scale-110">{icon}</div><h3 className="mb-4 text-2xl font-bold text-[#063e91]">{title}</h3><p className="leading-relaxed text-slate-600">{body}</p><div className="mt-auto border-t border-slate-100 pt-5 text-sm font-semibold text-[#064bb2]">{footer === "score" ? <><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[85%] rounded-full bg-cyan-500" /></div><p className="mt-2 text-[10px] uppercase tracking-widest text-slate-500">Institutional Average: 82/100</p></> : footer === "avatars" ? <div className="flex -space-x-2"><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-indigo-200 text-[10px]">VS</span><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-cyan-200 text-[10px]">AI</span><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-purple-200 text-[10px]">IR</span></div> : footer}</div></article>;
}

function ScorePanel({ score, dashOffset }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"><div className="flex items-center justify-between text-xs font-semibold text-slate-500"><span className="flex items-center gap-2"><span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />SESSION LIVE: 02:14</span><span className="rounded bg-slate-100 px-2 py-1">v2.4 ENGINE</span></div><div className="flex flex-col items-center py-8"><div className="relative h-48 w-48"><svg className="h-full w-full -rotate-90"><circle className="text-slate-100" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12" /><circle className="text-[#064bb2] transition-all duration-1000" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeDasharray="502" strokeDashoffset={dashOffset} strokeWidth="12" /></svg><div className="absolute inset-0 grid place-content-center text-center"><strong className="text-4xl text-[#063e91]">{score}</strong><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sentiment</span></div></div><div className="mt-4 rounded-full bg-indigo-50 px-4 py-2 text-sm"><span className="font-bold text-[#064bb2]">Shark Mood:</span> <span className="text-slate-600">Highly Interested</span></div></div><div className="rounded-xl border border-slate-100 bg-slate-50 p-4"><p className="mb-1 text-xs font-bold text-[#064bb2]">TRANSCRIPT</p><p className="text-sm leading-relaxed text-slate-600">&quot;...so we are solving the logistics gap for Tier-2 cities by using a hub-and-spoke model powered by local retail partners...&quot;</p></div><div className="grid place-items-center pt-5"><Link href="/login/launch-pad?error=login_required" aria-label="Start microphone pitch session" className="grid h-16 w-16 place-items-center rounded-full bg-[#064bb2] text-white shadow-lg transition hover:scale-95"><Mic className="h-7 w-7" /></Link></div></div>;
}
