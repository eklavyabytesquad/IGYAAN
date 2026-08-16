"use client";

import Image from "next/image";
import Link from "next/link";
import {
	ArrowUpRight,
	BarChart3,
	BookOpen,
	CalendarDays,
	CheckSquare,
	ClipboardCheck,
	Clock3,
	FileText,
	Megaphone,
	MoreVertical,
	Upload,
	UsersRound,
} from "lucide-react";

const quickActions = [
	{ label: "Create Assignment", href: "/dashboard/homework", icon: ClipboardCheck, tone: "purple" },
	{ label: "Mark Attendance", href: "/dashboard/attendance", icon: UsersRound, tone: "rose" },
	{ label: "Upload Material", href: "/dashboard/tools", icon: Upload, tone: "blue" },
	{ label: "Send Announcement", href: "/dashboard/faculty-chat", icon: Megaphone, tone: "orange" },
	{ label: "Create Test", href: "/dashboard/question-paper", icon: CheckSquare, tone: "green" },
];

const toneClasses = {
	purple: "bg-violet-50 text-violet-600",
	rose: "bg-rose-50 text-rose-500",
	blue: "bg-blue-50 text-blue-600",
	orange: "bg-orange-50 text-orange-500",
	green: "bg-emerald-50 text-emerald-600",
};

const activities = [
	["Riya - Class 2", "Uploaded art portfolio", "30 minutes ago"],
	["Rahul - Class 3", "Completed science project", "1 hour ago"],
	["Harshi - Class 2", "Submitted maths assignment", "2 hours ago"],
];

const classes = [
	["Room 102", "Class 3A - Maths", "08:30 AM - 10:30 AM"],
	["Room 102", "Class 8C - Maths", "11:00 AM - 12:30 PM"],
];

export default function FacultyDashboard({ user }) {
	const firstName = user?.full_name?.split(" ")[0] || "Issac";

	return (
		<div className="min-h-full bg-[#fafafa] px-4 py-4 text-[#141414] sm:px-6 lg:px-8">
			<div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_270px]">
				<div className="space-y-3">
					<section className="rounded-xl border border-[#eee] bg-white p-5 shadow-[0_1px_2px_rgba(20,20,20,0.02)]">
						<div className="flex min-h-[133px] items-center justify-between overflow-hidden rounded-xl border border-[#eee] bg-gradient-to-r from-[#f4f6f7] via-[#f4f6f7] to-[#f7f7f7] px-5 py-4">
							<div>
								<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Good Morning, {firstName} 👋</h1>
								<p className="mt-1 text-sm text-[#141414]">You have <strong>3 classes</strong> and <strong>2 tasks</strong> waiting for you today.</p>
							</div>
							<Image src="/figma-dashboard/hero.png" alt="Teacher planning a lesson" width={330} height={193} className="hidden h-[150px] w-[280px] object-cover object-right sm:block" priority />
						</div>
						<div className="mt-5 grid gap-3 md:grid-cols-3">
							<StatCard icon={BookOpen} label="Today’s Classes" value="3" tone="blue" />
							<StatCard icon={BarChart3} label="Overall performance" value="23%" tone="purple" />
							<StatCard icon={Clock3} label="Learning time" value="2 hr" tone="green" />
						</div>
					</section>

					<section className="rounded-xl border border-[#eee] bg-white p-5">
						<h2 className="text-base font-semibold">Quick Actions</h2>
						<div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
							{quickActions.map(({ label, href, icon: Icon, tone }) => (
								<Link key={label} href={href} className="group flex min-h-[100px] flex-col items-center justify-center rounded-lg transition hover:bg-[#fafafa]">
									<span className={`grid h-14 w-14 place-items-center rounded-xl ${toneClasses[tone]} transition group-hover:-translate-y-0.5`}><Icon className="h-6 w-6" strokeWidth={1.8} /></span>
									<span className="mt-3 text-center text-sm text-[#767676]">{label}</span>
								</Link>
							))}
						</div>
					</section>

					<section className="rounded-xl border border-[#eee] bg-white p-5">
						<div className="flex items-center justify-between">
							<h2 className="text-base font-semibold">Student Activity</h2>
							<Link href="/dashboard/student-management" className="flex items-center gap-1 text-xs font-medium text-[#e17543] hover:underline">View all <ArrowUpRight className="h-3.5 w-3.5" /></Link>
						</div>
						<div className="mt-5 divide-y divide-[#f0f0f0]">
							{activities.map(([name, action, time]) => (
								<div key={name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
									<div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-violet-600 text-white"><FileText className="h-4 w-4" /></div>
									<div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{name}</p><p className="truncate text-sm text-[#767676]">{action} <span>• {time}</span></p></div>
									<button type="button" aria-label={`More actions for ${name}`} className="text-[#999] hover:text-[#141414]"><MoreVertical className="h-4 w-4" /></button>
								</div>
							))}
						</div>
					</section>
				</div>

				<aside className="space-y-3">
					<AttendanceCard />
					<section className="rounded-xl border border-[#eee] bg-white p-5">
						<div className="flex items-center justify-between"><h2 className="text-base font-semibold">Upcoming</h2><Link href="/dashboard/timetable" className="text-xs font-medium text-[#e17543] hover:underline">View all</Link></div>
						<div className="mt-5 space-y-3">{classes.map(([room, title, time]) => <div key={title} className="rounded-xl border border-[#e5e5e5] p-3"><p className="text-xs font-semibold text-emerald-600">{room}</p><p className="mt-1 text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-[#767676]">{time}</p></div>)}</div>
					</section>
				</aside>
			</div>
		</div>
	);
}

function StatCard({ icon: Icon, label, value, tone }) {
	const tones = { blue: "bg-blue-50 text-blue-600", purple: "bg-violet-50 text-violet-500", green: "bg-emerald-50 text-emerald-600" };
	return <div className="flex items-center gap-3 rounded-xl border border-[#e5e5e5] p-3"><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ${tones[tone]}`}><Icon className="h-6 w-6" strokeWidth={1.7} /></span><div><p className="text-sm text-[#767676]">{label}</p><p className="mt-0.5 text-2xl font-semibold leading-none">{value}</p></div></div>;
}

function AttendanceCard() {
	const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	const dates = ["", "", "", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
	return <section className="rounded-xl border border-[#eee] bg-white p-5"><div className="flex items-center justify-between"><button type="button" aria-label="Previous month" className="text-xl">‹</button><h2 className="text-sm font-semibold">July Attendance</h2><button type="button" aria-label="Next month" className="text-xl">›</button></div><div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] text-[#aaa]">{days.map((day) => <span key={day}>{day}</span>)}{dates.map((date, index) => <span key={`${date}-${index}`} className={`grid h-6 place-items-center rounded-md text-xs ${["1", "2", "3"].includes(date) ? "bg-rose-100 text-[#141414]" : date && index > 3 && index < 20 ? "bg-emerald-50 text-[#141414]" : "text-[#aaa]"} ${date === "17" ? "ring-1 ring-emerald-500" : ""}`}>{date}</span>)}</div></section>;
}
