"use client";

import { Handshake, Headset, MapPin, Send } from "lucide-react";
import { useState } from "react";

const fieldClassName = "w-full rounded-xl border border-white/80 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-blue-200 focus:border-[#064bb2] focus:ring-4 focus:ring-[#064bb2]/10 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_#ffffff_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a] [&:-webkit-autofill]:[caret-color:#0f172a]";
const EMAIL_COMPOSE_URL = "https://mail.google.com/mail/?view=cm&fs=1&to=igyan.ai.team@gmail.com";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors = {};

    form.querySelectorAll("[required]").forEach((field) => {
      if (!field.value.trim()) nextErrors[field.id] = "This field is required.";
    });

    const email = form.elements.email;
    if (!nextErrors.email && !email.validity.valid) {
      nextErrors.email = "Please enter a valid email address.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setSent(true);
  }

  function clearError(id) {
    if (!errors[id]) return;
    setErrors((current) => ({ ...current, [id]: "" }));
  }

  return <main className="bg-white">
    <section className="relative overflow-hidden bg-gradient-to-b from-[#3b1595] via-[#2f1078] to-[#0a051c] px-6 py-20 text-center text-white sm:px-10 md:py-24">
      <Sparkle className="absolute left-8 top-1/3 hidden h-11 w-11 text-amber-500 sm:block" />
      <Sparkle className="absolute right-10 top-1/3 hidden h-12 w-12 text-orange-500 sm:block" />
      <div className="relative mx-auto max-w-3xl"><h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Let&apos;s Build the Future of Learning</h1><p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-indigo-100">Have questions about our AI OS, institutional licensing, or partnership opportunities? Reach out, and our team will get in touch with you shortly.</p></div>
    </section>
    <section className="px-6 py-16 sm:px-10 md:py-20">
    <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
      <aside className="pt-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#064bb2] sm:text-4xl">Contact Information</h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-600">Connect with our global support and sales team for personalized advice and integration support.</p>
        <div className="mt-9 space-y-5">
          <ContactCard icon={Handshake} title="Partnerships" description="For schools, colleges, and enterprise licensing." />
          <ContactCard icon={Headset} title="Technical Help" description="For help with Sudarshan AI or student accounts." />
          <div className="flex items-start gap-5 rounded-3xl bg-white p-7 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.28)]"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#064bb2]"><MapPin className="h-6 w-6" /></span><div><h2 className="font-bold text-[#064bb2]">Our offices</h2><p className="mt-2 font-semibold text-slate-700">Mumbai, Maharashtra, India</p><p className="mt-4 text-sm font-bold uppercase tracking-wide text-slate-500">Sub branches</p><p className="mt-1 leading-7 text-slate-600">Delhi, India<br />Patna, Bihar, India</p></div></div>
        </div>
      </aside>

      <section id="contact-form" className="rounded-3xl border border-blue-200 bg-gradient-to-br from-[#c8e8f8] to-[#b8cdef] p-7 shadow-[0_24px_55px_-26px_rgba(30,100,170,0.45)] sm:p-10">
        <h2 className="text-2xl font-extrabold tracking-tight text-[#064bb2]">Send us a Message</h2>
        {sent ? <div className="py-14 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-600">✓</div><h3 className="mt-5 text-2xl font-bold text-[#1e1b4b]">Message received</h3><p className="mx-auto mt-3 max-w-md leading-relaxed text-slate-600">Thank you for reaching out. Our team will review your enquiry and get back to you shortly.</p><button type="button" onClick={() => { setSent(false); setErrors({}); }} className="mt-7 rounded-full border border-[#064bb2]/25 bg-white px-6 py-3 text-sm font-bold text-[#064bb2] transition hover:border-[#064bb2]">Send another message</button></div> : <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="First Name" id="first-name" placeholder="John" required error={errors["first-name"]} onChange={() => clearError("first-name")} />
            <Field label="Last Name" id="last-name" placeholder="Doe" required error={errors["last-name"]} onChange={() => clearError("last-name")} />
          </div>
              <Field label="Email Address" id="email" type="email" spellCheck={false} placeholder="johndoe@example.com" required error={errors.email} onChange={() => clearError("email")} />
          <Field label="Institution / School Name" id="institution" placeholder="IGYAN AI Academy" />
          <div><label htmlFor="message" className="mb-2 block text-sm font-semibold text-slate-700">Message <span className="text-rose-500">*</span></label><textarea id="message" name="message" rows={5} required aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "message-error" : undefined} onChange={() => clearError("message")} placeholder="How can we help your school or organization?" className={`${fieldClassName} ${errors.message ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : ""}`} />{errors.message && <p id="message-error" className="mt-2 text-sm font-semibold text-rose-600">{errors.message}</p>}</div>
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#064bb2] px-8 py-4 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#003d91] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064bb2]">Submit Request <Send className="h-5 w-5" /></button>
        </form>}
      </section>
    </div>
    </section>
  </main>;
}

function Sparkle({ className }) { return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0 14.8 9.2 24 12l-9.2 2.8L12 24l-2.8-9.2L0 12l9.2-2.8L12 0Z" /></svg>; }

function Field({ label, id, type = "text", placeholder, required = false, error, onChange, spellCheck }) {
  return <div><label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">{label} {required && <span className="text-rose-500">*</span>}</label><input id={id} name={id} type={type} required={required} spellCheck={spellCheck} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onChange={onChange} placeholder={placeholder} className={`${fieldClassName} ${error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : ""}`} />{error && <p id={`${id}-error`} className="mt-2 text-sm font-semibold text-rose-600">{error}</p>}</div>;
}

function ContactCard({ icon: Icon, title, description }) {
  return <a href={EMAIL_COMPOSE_URL} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-5 rounded-3xl bg-white p-7 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.28)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(6,75,178,0.3)]"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#064bb2]"><Icon className="h-6 w-6" /></span><span><span className="block font-bold text-[#064bb2]">{title}</span><span className="mt-1 block text-sm font-semibold text-slate-500">{description}</span><span className="mt-2 block text-sm font-bold text-[#064bb2]">igyan.ai.team@gmail.com</span></span></a>;
}
