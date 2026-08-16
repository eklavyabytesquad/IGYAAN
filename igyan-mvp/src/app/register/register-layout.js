import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import Logo from "@/components/logo";

const COPY = {
  institutional: {
    title: "Start your AI journey today.",
    description: "Create an account to unlock intelligent tools for students, teachers, parents, and institutions.",
    points: ["Personalized learning dashboards", "Automated workflow and grading", "Real-time progress insights"],
  },
  launch: {
    title: "Build what comes next.",
    description: "Create your personal workspace for guided learning, mentorship, and ambitious projects.",
    points: ["Personalized learning pathways", "Guidance from AI mentors", "Progress that stays with you"],
  },
};

export default function RegisterLayout({ variant = "institutional", children }) {
  const content = COPY[variant] ?? COPY.institutional;
  return (
    <div className="register-shell flex h-screen overflow-hidden bg-white text-slate-900">
      <aside className="register-visual relative hidden h-screen w-1/2 overflow-hidden px-10 py-12 md:flex xl:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(122deg,#1666be_0%,#27358e_46%,#74159d_100%)]" />
        <div className="absolute inset-0 opacity-[0.13] [background-image:radial-gradient(#fff_1.15px,transparent_1.15px)] [background-size:32px_32px]" />
        <Sparkles className="absolute left-[7%] top-[34%] h-10 w-10 rotate-12 text-[#f3cb60]/75" />
        <Sparkles className="absolute bottom-[20%] right-[9%] h-12 w-12 -rotate-12 text-[#b69cf4]/55" />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[620px] flex-col">
          <Link href="/" className="flex w-fit items-center gap-3 text-white transition-opacity hover:opacity-85">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/25 bg-white/10 p-2 shadow-[0_12px_30px_rgba(12,18,80,0.24)] backdrop-blur-md"><Logo variant="compact" /></div>
            <span className="text-[1.8rem] font-extrabold tracking-tight">IGYAN AI</span>
          </Link>
          <div className="my-auto py-10">
            <h1 className="max-w-[550px] text-4xl font-extrabold leading-[1.12] tracking-[-0.04em] text-white xl:text-5xl">{content.title}</h1>
            <p className="mt-7 max-w-[540px] text-base leading-relaxed text-indigo-100 xl:text-lg">{content.description}</p>
            <ul className="mt-10 space-y-4 text-[0.95rem] font-medium text-indigo-50 xl:text-base">
              {content.points.map((point, index) => <li key={point} className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/20 ${index === 0 ? "text-cyan-300" : index === 1 ? "text-purple-200" : "text-pink-200"}`}><Check className="h-5 w-5" /></span>{point}</li>)}
            </ul>
          </div>
          <p className="text-sm text-indigo-100"><span className="font-bold text-white">IGYAN AI</span> — learning, made personal.</p>
        </div>
      </aside>
      <section className="relative flex h-screen w-full justify-center overflow-y-auto bg-white px-6 py-8 md:w-1/2 md:overflow-hidden md:px-10 xl:px-20">
        <Link href="/" className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 md:hidden">← Home</Link>
        <div className="w-full max-w-[560px] self-start">{children}</div>
      </section>
    </div>
  );
}
