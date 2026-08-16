"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import Logo from "@/components/logo";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className="relative flex min-h-screen overflow-x-clip bg-[#f8fbff] text-slate-900">
      <section className="relative hidden w-1/2 overflow-hidden bg-[#242a81] px-10 py-12 md:flex xl:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(122deg,#1666be_0%,#27358e_46%,#74159d_100%)]" />
        <div className="absolute inset-0 opacity-[0.13] [background-image:radial-gradient(#fff_1.15px,transparent_1.15px)] [background-size:32px_32px]" />
        <div className="absolute -left-24 bottom-[-10rem] h-[28rem] w-[28rem] rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-[-6rem] h-[24rem] w-[24rem] rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="relative z-10 mx-auto flex w-full max-w-[620px] flex-col">
          <Link href="/" className="flex w-fit items-center gap-3 text-white transition-opacity hover:opacity-85">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/25 bg-white/10 p-2 shadow-[0_12px_30px_rgba(12,18,80,0.24)] backdrop-blur-md"><Logo variant="compact" /></div>
            <span className="text-[1.8rem] font-extrabold tracking-tight">IGYAN AI</span>
          </Link>
          <div className="my-auto py-16">
            <div className="mb-7 grid h-14 w-14 place-items-center rounded-2xl border border-white/20 bg-white/10 text-cyan-200 backdrop-blur-md"><LockKeyhole className="h-7 w-7" /></div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">Account recovery</p>
            <h1 className="mt-4 max-w-[580px] text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl xl:text-6xl">Get back to the work that moves learning forward.</h1>
            <p className="mt-7 max-w-[520px] text-lg leading-relaxed text-indigo-100 xl:text-xl">Reset your password securely and return to your personalized learning or institutional workspace.</p>
          </div>
          <p className="text-sm text-indigo-100/80">One intelligent system for every learning journey.</p>
        </div>
      </section>

      <section className="relative flex w-full items-center justify-center px-6 py-12 sm:px-12 md:w-1/2 md:py-16 xl:px-24">
        <Link href="/login" className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-[#0955b9] sm:left-12 md:left-8 xl:left-16"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
        <div className="w-full max-w-[560px]">
          <div className="mb-9 md:hidden"><Link href="/" className="flex w-fit items-center gap-2 text-[#0f1d3c]"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-white shadow-sm"><Logo variant="compact" /></span><span className="text-xl font-extrabold">IGYAN AI</span></Link></div>
          {sent ? (
            <div className="rounded-[2rem] border border-blue-100 bg-white p-8 text-center shadow-[0_24px_70px_-35px_rgba(15,70,160,0.35)] sm:p-10">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></div>
              <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#0f1d3c]">Check your inbox</h1>
              <p className="mt-4 leading-relaxed text-slate-600">If an account exists for that email address, you&apos;ll receive password reset instructions shortly.</p>
              <Link href="/login" className="mt-8 inline-flex items-center justify-center rounded-full bg-[#0955b9] px-6 py-3 font-bold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#073e88]">Return to sign in</Link>
            </div>
          ) : (
            <>
              <div className="mb-9">
                <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[#eaf1ff] text-[#0955b9]"><LockKeyhole className="h-8 w-8" /></div>
                <p className="text-base font-bold uppercase tracking-[0.2em] text-[#0955b9]">Forgot password</p>
                <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.04em] text-[#0f1d3c] sm:text-5xl">Reset your password</h1>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-500">Enter the email address linked to your account and we&apos;ll help you get back in.</p>
              </div>
              <form onSubmit={handleSubmit} className="rounded-[2rem] border border-blue-100 bg-white p-8 shadow-[0_24px_70px_-35px_rgba(15,70,160,0.35)] sm:p-11">
                <label htmlFor="reset-email" className="ml-1 block text-base font-semibold text-slate-700">Email address</label>
                <div className="relative mt-2.5"><Mail className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400" /><input id="reset-email" name="email" type="email" autoComplete="email" spellCheck={false} required placeholder="you@example.com" className="auth-reset-input w-full rounded-xl border border-[#d0d9e9] bg-white py-4 pl-14 pr-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0955b9] focus:ring-2 focus:ring-[#0955b9]/20" /></div>
                <button type="submit" className="mt-8 w-full rounded-full bg-[#0955b9] px-4 py-4 text-lg font-bold text-white shadow-lg shadow-[#0955b9]/20 transition hover:-translate-y-0.5 hover:bg-[#073e88] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0955b9]">Send reset link</button>
                <p className="mt-7 text-center text-base leading-relaxed text-slate-500">Need help? <Link href="/contact" className="font-bold text-[#0955b9] hover:text-[#073e88]">Contact support</Link></p>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
