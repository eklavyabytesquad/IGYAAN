export default function RouteSkeleton({ variant = "page" }) {
  const auth = variant === "auth";
  const dashboard = variant === "dashboard";

  if (dashboard) {
    return (
      <div className="flex h-screen animate-pulse overflow-hidden bg-slate-50" aria-label="Loading" role="status">
        <aside className="hidden w-16 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="mx-auto mt-6 h-9 w-9 rounded-full bg-slate-200" />
          <div className="mt-14 space-y-6 px-4">
            {Array.from({ length: 9 }).map((_, index) => <div key={index} className="h-6 w-6 rounded-md bg-slate-100" />)}
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="m-3 h-20 rounded-2xl border border-slate-100 bg-white p-5"><div className="h-10 w-72 max-w-full rounded-xl bg-slate-100" /></header>
          <main className="flex-1 p-5 lg:p-8"><div className="h-full min-h-[560px] rounded-2xl border border-slate-100 bg-white p-6"><div className="h-6 w-32 rounded bg-slate-100" /><div className="mt-4 h-10 w-64 max-w-full rounded bg-slate-100" /><div className="mt-8 grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-40 rounded-xl bg-slate-100" />)}</div></div></main>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen animate-pulse ${auth ? "bg-slate-950" : "bg-white"}`} aria-label="Loading" role="status">
      {auth ? <div className="hidden w-1/2 bg-indigo-950 lg:block" /> : null}
      <div className="flex flex-1 items-center justify-center p-8"><div className={`w-full max-w-5xl space-y-6 ${auth ? "max-w-md" : ""}`}><div className={`h-8 rounded ${auth ? "w-28 bg-slate-700/60" : "w-40 bg-slate-200"}`} /><div className={`h-12 rounded ${auth ? "w-3/4 bg-slate-700/60" : "w-2/3 bg-slate-200"}`} /><div className={`h-5 w-full rounded ${auth ? "bg-slate-800/60" : "bg-slate-100"}`} /><div className="grid gap-5 md:grid-cols-3"><div className={`h-36 rounded-2xl ${auth ? "bg-slate-800/60" : "bg-slate-100"}`} /><div className={`h-36 rounded-2xl ${auth ? "bg-slate-800/60" : "bg-slate-100"}`} /><div className={`h-36 rounded-2xl ${auth ? "bg-slate-800/60" : "bg-slate-100"}`} /></div><div className={`h-12 w-44 rounded-full ${auth ? "bg-indigo-500/50" : "bg-slate-200"}`} /></div></div>
    </div>
  );
}
