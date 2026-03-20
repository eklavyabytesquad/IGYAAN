"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/logo";
import { supabase } from "@/app/utils/supabase";

/* ───────── helper: fetch all rows for a page ───────── */
async function fetchPageContent(page) {
  const { data, error } = await supabase
    .from("dynamic_content")
    .select("*")
    .eq("page", page)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching dynamic_content:", error);
    return [];
  }
  return data || [];
}

function getBySection(rows, section) {
  return rows.filter((r) => r.section === section);
}
function getText(rows, section, key) {
  const row = rows.find((r) => r.section === section && r.content_key === key);
  return row?.content_value ?? "";
}

function MediaCarousel({ mediaFeatures }) {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);
  const duplicatedMedia = [...mediaFeatures, ...mediaFeatures];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId;
    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const scroll = () => {
      if (!isPaused) {
        scrollPosition += scrollSpeed;
        if (scrollPosition >= scrollContainer.scrollWidth / 2) {
          scrollPosition = 0;
        }
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  if (!mediaFeatures.length) return null;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent dark:from-slate-950 z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent dark:from-slate-950 z-10" />
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-hidden py-6"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {duplicatedMedia.map((media, index) => (
          <a
            key={`${media.name}-${index}`}
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group shrink-0 w-[420px] h-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:shadow-sky-500/25 hover:border-sky-400 cursor-pointer overflow-hidden"
          >
            <div className="relative h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={`https://api.microlink.io/?url=${encodeURIComponent(media.url)}&screenshot=true&meta=false&embed=screenshot.url`}
                alt={`${media.name} article preview`}
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-sky-500 via-cyan-500 to-sky-600">
                <div className="text-center text-white p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-16 w-16 mx-auto mb-3 opacity-80">
                    <path fillRule="evenodd" d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 0 0 3 3h15a3 3 0 0 1-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125ZM12 9.75a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H12Zm-.75-2.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H12a.75.75 0 0 1-.75-.75ZM6 12.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5H6Zm-.75 3.75a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75ZM6 6.75a.75.75 0 0 0-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-3A.75.75 0 0 0 9 6.75H6Z" clipRule="evenodd" />
                    <path d="M18.75 6.75h1.875c.621 0 1.125.504 1.125 1.125V18a1.5 1.5 0 0 1-3 0V6.75Z" />
                  </svg>
                  <span className="font-bold text-lg">{media.name}</span>
                </div>
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white shadow-lg backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                  {media.name}
                </span>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="inline-flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 p-2 shadow-lg backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-sky-600 dark:text-sky-400">
                    <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function AboutPage() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageContent("about").then((data) => {
      setContent(data);
      setLoading(false);
    });
  }, []);

  /* ── derived data ── */
  const heroTitle = getText(content, "hero", "title");
  const heroDesc = getText(content, "hero", "description");

  const values = getBySection(content, "values")
    .filter((r) => r.content_key === "item")
    .map((r) => ({ title: r.content_value, description: r.metadata1 }));

  const problemStatements = getBySection(content, "problem_statements")
    .filter((r) => r.content_key === "item")
    .map((r) => ({
      icon: r.metadata1,
      text: r.content_value,
      contrast: r.metadata2,
    }));

  const mediaFeatures = getBySection(content, "media")
    .filter((r) => r.content_key === "item")
    .map((r) => ({ name: r.content_value, url: r.metadata1 }));

  const journeyBadge = getText(content, "journey", "badge");
  const journeyTitle = getText(content, "journey", "title");
  const journeyIntro = getText(content, "journey", "intro");
  const journeyInsight1 = getText(content, "journey", "insight_1");
  const journeyInsight2 = getText(content, "journey", "insight_2");
  const journeyBridge = getText(content, "journey", "bridge_text");
  const journeyClosing = getText(content, "journey", "closing");

  const ctaTitle = getText(content, "cta", "title");
  const ctaDesc = getText(content, "cta", "description");
  const ctaPrimaryText = getText(content, "cta", "primary_btn_text");
  const ctaPrimaryLink = getText(content, "cta", "primary_btn_link") || "/contact";
  const ctaSecondaryText = getText(content, "cta", "secondary_btn_text");
  const ctaSecondaryLink = getText(content, "cta", "secondary_btn_link") || "/features";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-20">
      {/* Hero */}
      <div className="max-w-3xl">
        <Logo variant="card" className="mb-6 scale-250 transform-gpu origin-left" />
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {heroTitle}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
          {heroDesc}
        </p>
      </div>

      {/* Values */}
      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {values.map((value) => (
          <article
            key={value.title}
            className="rounded-2xl border border-zinc-200 bg-white/85 p-6 shadow-md shadow-sky-500/15 transition-transform hover:-translate-y-1 dark:border-slate-900 dark:bg-slate-950/70"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {value.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {value.description}
            </p>
          </article>
        ))}
      </section>

      {/* Our Journey */}
      <section className="mt-20 rounded-3xl border border-zinc-200 bg-white/92 p-10 shadow-2xl shadow-sky-500/10 dark:border-slate-900 dark:bg-slate-950/75">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
          {journeyBadge}
        </div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          {journeyTitle}
        </h2>

        <div className="mt-8 space-y-6">
          <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
            {journeyIntro}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {problemStatements.map((item, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50/80 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/10 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm dark:bg-slate-800">
                  {item.icon}
                </span>
                <p className="text-sm font-medium text-zinc-500 line-through decoration-zinc-300 dark:text-zinc-400 dark:decoration-zinc-600">
                  {item.text}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-sky-600 dark:text-sky-400">
                  {item.contrast}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-6 dark:border-sky-900/40 dark:bg-sky-950/20">
            <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-200">
              {journeyInsight1}
            </p>
            <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
              {journeyInsight2}
            </p>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-indigo-50 p-6 dark:border-sky-800 dark:from-sky-950/30 dark:to-indigo-950/30">
            <p className="text-base font-medium leading-relaxed text-zinc-800 dark:text-zinc-100">
              {journeyBridge}
            </p>
          </div>

          <p className="text-center text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
            {journeyClosing}
          </p>
        </div>
      </section>

      {/* Featured In Media / Press Coverage */}
      <section className="mt-20">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-sky-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-sky-300 mb-4">
            📰 Press Coverage
          </span>
          <h2 className="text-3xl font-semibold text-zinc-900 dark:text-white">
            Featured In Media
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base text-zinc-600 dark:text-zinc-300">
            Trusted by leading publications worldwide. See what the media is saying about iGyanAI.
          </p>
        </div>
        <MediaCarousel mediaFeatures={mediaFeatures} />
        <div className="mt-6 text-center">
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            Featured in <span className="text-sky-600 dark:text-sky-400">{mediaFeatures.length}+</span> publications across{" "}
            <span className="text-sky-600 dark:text-sky-400">8+ countries</span>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-700 px-8 py-16 text-white shadow-2xl shadow-sky-900/30">
        <div className="max-w-3xl space-y-6">
          <h2 className="text-3xl font-semibold">
            {ctaTitle}
          </h2>
          <p className="text-base text-sky-100/90">
            {ctaDesc}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={ctaPrimaryLink}
              className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-sky-700 shadow-lg shadow-sky-900/30 transition-transform hover:-translate-y-0.5"
            >
              {ctaPrimaryText}
            </Link>
            <Link
              href={ctaSecondaryLink}
              className="rounded-lg border border-white/60 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {ctaSecondaryText}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
