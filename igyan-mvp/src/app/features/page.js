"use client";

import { useState, useEffect } from "react";
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

export default function FeaturesPage() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageContent("features").then((data) => {
      setContent(data);
      setLoading(false);
    });
  }, []);

  /* ── derived data ── */
  const heroTitle = getText(content, "hero", "title");
  const heroDesc = getText(content, "hero", "description");

  // Feature Groups — grouped by sub_page
  const fgRows = getBySection(content, "feature_groups").filter((r) => r.content_key === "item");
  const featureGroups = Object.values(
    fgRows.reduce((acc, r) => {
      const group = r.sub_page || "Other";
      if (!acc[group]) acc[group] = { title: group, items: [] };
      acc[group].items.push(r.content_value);
      return acc;
    }, {})
  );

  // Academic Intelligence
  const acBadge = getText(content, "academic_intelligence", "badge");
  const acTitle = getText(content, "academic_intelligence", "title");
  const acDesc = getText(content, "academic_intelligence", "description");
  const academicIntelligence = getBySection(content, "academic_intelligence")
    .filter((r) => r.content_key === "item")
    .map((r) => ({ name: r.content_value, detail: r.metadata1, icon: r.metadata2 }));

  // Smart Admin
  const saBadge = getText(content, "smart_admin", "badge");
  const saTitle = getText(content, "smart_admin", "title");
  const saDesc = getText(content, "smart_admin", "description");
  const smartAdmin = getBySection(content, "smart_admin")
    .filter((r) => r.content_key === "item")
    .map((r) => ({ name: r.content_value, detail: r.metadata1, icon: r.metadata2 }));

  // Automations
  const autoTitle = getText(content, "automations", "title");
  const automations = getBySection(content, "automations")
    .filter((r) => r.content_key === "item")
    .map((r) => ({ name: r.content_value, detail: r.metadata1 }));

  // Governance
  const govTitle = getText(content, "governance", "title");
  const govItems = getBySection(content, "governance")
    .filter((r) => r.content_key.startsWith("item_"))
    .map((r) => r.content_value);
  const govDesc = getText(content, "governance", "description");

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-20">
      <header className="max-w-3xl">
        <Logo variant="card" className="mb-6 scale-250 transform-gpu origin-left" />
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {heroTitle}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
          {heroDesc}
        </p>
      </header>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {featureGroups.map((group) => (
          <article
            key={group.title}
            className="rounded-2xl border border-zinc-200 bg-white/85 p-6 shadow-lg shadow-sky-500/15 transition-transform hover:-translate-y-1 dark:border-slate-900 dark:bg-slate-950/70"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {group.title}
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {group.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      {/* Academic & Learning Intelligence */}
      <section className="mt-20 rounded-3xl border border-zinc-200 bg-white/92 p-10 shadow-2xl shadow-sky-500/10 dark:border-slate-900 dark:bg-slate-950/75">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
          {acBadge}
        </div>
        <h2 className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-white">
          {acTitle}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          {acDesc}
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {academicIntelligence.map((item) => (
            <div
              key={item.name}
              className="group rounded-2xl border border-sky-100 bg-sky-50/75 p-6 shadow-sm shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/15 dark:border-sky-900/40 dark:bg-slate-900/50"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl shadow-sm dark:bg-slate-800">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-sky-600 dark:text-sky-300">
                {item.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Smart Administration & Innovation Suite */}
      <section className="mt-12 rounded-3xl border border-zinc-200 bg-white/92 p-10 shadow-2xl shadow-sky-500/10 dark:border-slate-900 dark:bg-slate-950/75">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
          {saBadge}
        </div>
        <h2 className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-white">
          {saTitle}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          {saDesc}
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {smartAdmin.map((item) => (
            <div
              key={item.name}
              className="group rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6 shadow-sm shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/15 dark:border-indigo-900/40 dark:bg-slate-900/50"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl shadow-sm dark:bg-slate-800">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">
                {item.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 rounded-3xl border border-zinc-200 bg-white/92 p-10 shadow-2xl shadow-sky-500/10 dark:border-slate-900 dark:bg-slate-950/75">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          {autoTitle}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {automations.map((automation) => (
            <div
              key={automation.name}
              className="rounded-2xl border border-sky-100 bg-sky-50/75 p-6 shadow-sm shadow-sky-500/10 dark:border-sky-900/40 dark:bg-slate-900/50"
            >
              <h3 className="text-lg font-semibold text-sky-600 dark:text-sky-300">
                {automation.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {automation.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-sky-700 px-8 py-16 text-white shadow-2xl shadow-sky-900/30">
        <div className="max-w-3xl space-y-6">
          <h2 className="text-3xl font-semibold">
            {govTitle}
          </h2>
          <ul className="space-y-3 text-base text-sky-100/90">
            {govItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="text-sm text-sky-100/80">
            {govDesc}
          </p>
        </div>
      </section>
    </div>
  );
}