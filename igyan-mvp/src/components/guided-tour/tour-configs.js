/*
 * Tour Step Configurations per User Role + Page-specific Tours
 * =============================================================
 * Each step has:
 *   - target: CSS selector for the element to highlight
 *   - title: Heading text
 *   - description: Body text
 *   - position: Where to place the tooltip (top | bottom | left | right)
 *   - icon: emoji
 *   - navigateTo: (optional) URL to navigate to when this step begins
 *   - clickTarget: (optional) if true, prompt user to click the highlighted element
 */

// ══════════════════════════════════════════════════════════════════
//  DASHBOARD TOUR STEPS — shown on /dashboard
// ══════════════════════════════════════════════════════════════════
export const TOUR_STEPS = {
	super_admin: [
		{
			target: '[data-tour="welcome-header"]',
			title: "Welcome to Your Command Center!",
			description: "This is your Super Admin dashboard. Monitor students, faculty, courses, and performance — everything at a glance.",
			position: "bottom",
			icon: "🏫",
		},
		{
			target: '[data-tour="nav-dashboard"]',
			title: "Dashboard Home",
			description: "You're here right now! This is your main overview page with all key metrics and quick actions.",
			position: "right",
			icon: "🏠",
		},
		{
			target: '[data-tour="nav-copilot"]',
			title: "Co-pilot AI Assistant",
			description: "Your AI-powered assistant for managing school operations. Click here anytime for smart suggestions, chat, and AI help.",
			position: "right",
			icon: "🤖",
		},
		{
			target: '[data-tour="nav-eventsManagement"]',
			title: "Events Management",
			description: "Create and manage school events, competitions, and activities. Click to explore after this tour!",
			position: "right",
			icon: "📅",
		},
		{
			target: '[data-tour="nav-gyanisage"]',
			title: "Buddy AI",
			description: "Your friendly AI companion for quick answers, brainstorming, and creative tasks.",
			position: "right",
			icon: "🧠",
		},
		{
			target: '[data-tour="nav-schoolManagement"]',
			title: "School Management",
			description: "Manage school settings, departments, classes, sections, and institutional configurations.",
			position: "right",
			icon: "🏛️",
		},
		{
			target: '[data-tour="nav-userManagement"]',
			title: "User Management",
			description: "Add, edit, and manage all users — students, faculty, parents, and staff.",
			position: "right",
			icon: "👥",
		},
		{
			target: '[data-tour="nav-userAccess"]',
			title: "Access & Roles",
			description: "Control who can access what. Manage role-based permissions across your school.",
			position: "right",
			icon: "🔒",
		},
		{
			target: '[data-tour="stat-cards"]',
			title: "Key Metrics at a Glance",
			description: "Track active courses, completed tasks, average performance, and total learning time across your school in real-time.",
			position: "bottom",
			icon: "📊",
		},
		{
			target: '[data-tour="quick-actions"]',
			title: "Quick Launchpad",
			description: "Your most-used tools — courses, AI assistants, Career Hub, support — all without digging through menus.",
			position: "bottom",
			icon: "🚀",
		},
		{
			target: '[data-tour="focus-board"]',
			title: "Today's Focus Board",
			description: "Curated daily tasks and priorities. Smart suggestions tailored to what matters most today.",
			position: "bottom",
			icon: "🎯",
		},
		{
			target: '[data-tour="ai-highlights"]',
			title: "AI-Powered Insights",
			description: "iGyanAI surfaces key highlights — student progress, coaching tips — so you never miss what's important.",
			position: "bottom",
			icon: "✨",
		},
		{
			target: '[data-tour="profile-card"]',
			title: "Your Profile",
			description: "View your details, edit settings, and resume AI chat sessions right from here.",
			position: "left",
			icon: "👤",
		},
		{
			target: '[data-tour="upcoming-sessions"]',
			title: "Upcoming Sessions",
			description: "Never miss a meeting or session. Your upcoming check-ins and events are always visible here.",
			position: "left",
			icon: "📅",
		},
	],

	co_admin: [
		{
			target: '[data-tour="welcome-header"]',
			title: "Welcome, Co-Admin!",
			description: "You have access to most admin features. Monitor school operations, manage events, and support the Super Admin.",
			position: "bottom",
			icon: "🏫",
		},
		{
			target: '[data-tour="nav-copilot"]',
			title: "Co-pilot AI",
			description: "Your AI assistant for managing school workflows and getting smart suggestions.",
			position: "right",
			icon: "🤖",
		},
		{
			target: '[data-tour="nav-eventsManagement"]',
			title: "Events",
			description: "Create and manage school events, competitions, and activities.",
			position: "right",
			icon: "📅",
		},
		{
			target: '[data-tour="stat-cards"]',
			title: "School Performance Metrics",
			description: "Monitor active courses, task completion, performance scores, and learning hours.",
			position: "bottom",
			icon: "📊",
		},
		{
			target: '[data-tour="quick-actions"]',
			title: "Quick Actions",
			description: "Jump to frequently used tools — courses, AI assistants, career hub, and support.",
			position: "bottom",
			icon: "🚀",
		},
	],

	faculty: [
		{
			target: '[data-tour="welcome-header"]',
			title: "Welcome to Your Teaching Hub!",
			description: "Your personalized dashboard to manage classes, track students, and leverage AI-powered teaching tools.",
			position: "bottom",
			icon: "📚",
		},
		{
			target: '[data-tour="nav-copilot"]',
			title: "Co-pilot AI",
			description: "Your AI teaching assistant. Get help with lesson plans, grading suggestions, and more.",
			position: "right",
			icon: "🤖",
		},
		{
			target: '[data-tour="nav-tools"]',
			title: "Teaching Tools Kit",
			description: "Access a suite of tools designed to enhance your teaching experience.",
			position: "right",
			icon: "🧰",
		},
		{
			target: '[data-tour="stat-cards"]',
			title: "Your Class Metrics",
			description: "See active courses, completed tasks, student performance, and teaching hours at a glance.",
			position: "bottom",
			icon: "📊",
		},
		{
			target: '[data-tour="quick-actions"]',
			title: "Quick Launchpad",
			description: "Open iGyanAI, access courses, check the career hub, or get support instantly.",
			position: "bottom",
			icon: "🚀",
		},
	],

	student: [
		{
			target: '[data-tour="welcome-header"]',
			title: "Welcome to Your Learning Space!",
			description: "Track goals, dive into AI sessions, and keep your learning streak alive!",
			position: "bottom",
			icon: "🎓",
		},
		{
			target: '[data-tour="nav-copilot"]',
			title: "Co-pilot AI",
			description: "Your personal AI study buddy. Ask questions, get explanations, and learn smarter.",
			position: "right",
			icon: "🤖",
		},
		{
			target: '[data-tour="nav-vivaLab"]',
			title: "AI Viva Lab",
			description: "Practice viva questions with AI and get instant feedback on your answers.",
			position: "right",
			icon: "🎙️",
		},
		{
			target: '[data-tour="stat-cards"]',
			title: "Your Progress Snapshot",
			description: "Active courses, completed tasks, performance score, and study time — all tracked for you.",
			position: "bottom",
			icon: "📊",
		},
		{
			target: '[data-tour="quick-actions"]',
			title: "Quick Launch",
			description: "Jump into courses, AI, Career Hub, or support — all one click away.",
			position: "bottom",
			icon: "🚀",
		},
	],

	counselor: [
		{
			target: '[data-tour="welcome-header"]',
			title: "Welcome, Counselor!",
			description: "Your dashboard for student wellbeing. Monitor safety alerts, manage sessions, and use AI tools.",
			position: "bottom",
			icon: "💚",
		},
		{
			target: '[data-tour="nav-activeAlerts"]',
			title: "Safety Alerts",
			description: "Monitor active safety alerts and respond to student wellbeing concerns.",
			position: "right",
			icon: "⚠️",
		},
		{
			target: '[data-tour="stat-cards"]',
			title: "Wellbeing Metrics",
			description: "Track active cases, completed sessions, wellbeing scores, and engagement time.",
			position: "bottom",
			icon: "📊",
		},
	],

	parent: [
		{
			target: '[data-tour="welcome-header"]',
			title: "Welcome, Parent!",
			description: "Stay connected with your child's education. Check attendance, reports, and communicate with teachers.",
			position: "bottom",
			icon: "👨‍👩‍👧",
		},
		{
			target: '[data-tour="nav-myChildren"]',
			title: "My Children",
			description: "View your children's attendance, grades, and overall progress in one place.",
			position: "right",
			icon: "👧",
		},
		{
			target: '[data-tour="nav-teacherConnect"]',
			title: "Teacher Connect",
			description: "Message your child's class teacher directly for updates and discussions.",
			position: "right",
			icon: "💬",
		},
		{
			target: '[data-tour="stat-cards"]',
			title: "Your Children's Overview",
			description: "See attendance, homework, performance, and important notices at a glance.",
			position: "bottom",
			icon: "📊",
		},
	],

	b2c_student: [
		{
			target: '[data-tour="welcome-header"]',
			title: "Welcome to Launch Pad!",
			description: "Your startup command center. Build ideas, sharpen pitches, and track your launch journey.",
			position: "bottom",
			icon: "🚀",
		},
		{
			target: '[data-tour="nav-copilot"]',
			title: "Sudarshan AI",
			description: "Your AI guide for thinking, building, and pitching. Enter command mode!",
			position: "right",
			icon: "🤖",
		},
		{
			target: '[data-tour="stat-cards"]',
			title: "Launch Metrics",
			description: "Track active ideas, launch tasks, pitch readiness, and build time.",
			position: "bottom",
			icon: "📊",
		},
		{
			target: '[data-tour="quick-actions"]',
			title: "Launch Console",
			description: "Explore ideas, enter AI, access Startup Lab, or get help — all in one place.",
			position: "bottom",
			icon: "⚡",
		},
	],

	b2c_mentor: [
		{
			target: '[data-tour="welcome-header"]',
			title: "Welcome to Your Mentor Console!",
			description: "Review builder ideas, provide guidance, and track your mentoring impact.",
			position: "bottom",
			icon: "🧑‍🏫",
		},
		{
			target: '[data-tour="nav-copilot"]',
			title: "Sudarshan AI (Mentor Mode)",
			description: "AI co-pilot for mentoring, reviewing, and guiding student builders.",
			position: "right",
			icon: "🤖",
		},
		{
			target: '[data-tour="stat-cards"]',
			title: "Mentoring Metrics",
			description: "Active builders, reviews completed, decision accuracy, and time invested.",
			position: "bottom",
			icon: "📊",
		},
		{
			target: '[data-tour="quick-actions"]',
			title: "Mentor Tools",
			description: "Open builder queue, AI mentor mode, validation desk, or get support.",
			position: "bottom",
			icon: "🛠️",
		},
	],
};

// ══════════════════════════════════════════════════════════════════
//  PAGE-SPECIFIC TOURS — triggered when user visits a page
// ══════════════════════════════════════════════════════════════════
export const PAGE_TOURS = {
	"/dashboard/copilot": [
		{
			target: '[data-tour="copilot-header"]',
			title: "Welcome to Co-pilot AI!",
			description: "This is your AI-powered assistant. Have conversations, get smart suggestions, and let AI help manage your work.",
			position: "bottom",
			icon: "🤖",
		},
		{
			target: '[data-tour="copilot-sidebar"]',
			title: "Chat History & Memory",
			description: "Your previous conversations are saved here. Switch between chats, view session memory, or check your overall memory bank.",
			position: "right",
			icon: "💾",
		},
		{
			target: '[data-tour="copilot-chat-area"]',
			title: "Chat Area",
			description: "This is where your AI conversation happens. Ask anything — lesson plans, analysis, brainstorming, or school management help.",
			position: "bottom",
			icon: "💬",
		},
		{
			target: '[data-tour="copilot-input"]',
			title: "Type or Speak",
			description: "Type your message or use the microphone for voice input. The AI understands natural language — just ask!",
			position: "top",
			icon: "🎙️",
		},
	],
	"/dashboard/events": [
		{
			target: '[data-tour="events-header"]',
			title: "Event Management Hub",
			description: "Create and manage all your school events from this page — academic events, competitions, cultural programs, and more.",
			position: "bottom",
			icon: "📅",
		},
		{
			target: '[data-tour="events-create-btn"]',
			title: "Create New Event",
			description: "Click this button to create a new event. Fill in the details like title, date, location, and type.",
			position: "left",
			icon: "➕",
		},
		{
			target: '[data-tour="events-search"]',
			title: "Search & Filter",
			description: "Quickly find events by name or filter by status — upcoming, ongoing, or completed.",
			position: "bottom",
			icon: "🔍",
		},
		{
			target: '[data-tour="events-list"]',
			title: "Your Events",
			description: "All your school events appear here as cards. Edit, delete, or view registrations for any event.",
			position: "top",
			icon: "📋",
		},
	],
	"/dashboard/gyanisage": [
		{
			target: '[data-tour="gyanisage-sidebar"]',
			title: "Counselling Modes",
			description: "Choose from 4 specialized AI modes — Life Counselling, Career Roadmap, Academic Growth, and Personal Development. Each mode is tailored with unique expertise.",
			position: "right",
			icon: "🧭",
		},
		{
			target: '[data-tour="gyanisage-prompts"]',
			title: "Quick Prompts",
			description: "Not sure where to start? Use these suggested prompts to kick off a conversation instantly. They change based on your selected mode.",
			position: "top",
			icon: "💡",
		},
		{
			target: '[data-tour="gyanisage-chat"]',
			title: "Chat Area",
			description: "Your AI conversations appear here. Career mode even generates visual roadmaps with phases, milestones, and timelines!",
			position: "bottom",
			icon: "💬",
		},
		{
			target: '[data-tour="gyanisage-input"]',
			title: "Send a Message",
			description: "Type your question or thought and press Enter or click the send button. The AI will respond with personalized guidance.",
			position: "top",
			icon: "✏️",
		},
	],
	"/dashboard/school-management": [
		{
			target: '[data-tour="school-hero"]',
			title: "School Overview",
			description: "Your school's command center. See the school name and a quick summary of all key data — sessions, subjects, classes, students, and faculty.",
			position: "bottom",
			icon: "🏫",
		},
		{
			target: '[data-tour="school-stats"]',
			title: "Quick Stats",
			description: "At-a-glance metrics for everything in your school — how many sessions, subjects, classes, students, faculty, and parents are registered.",
			position: "bottom",
			icon: "📊",
		},
		{
			target: '[data-tour="school-tabs"]',
			title: "Management Tabs",
			description: "Navigate between different management areas — Sessions, Subjects, Classes, Students, Faculty, Attendance, Transfers, and more. Each tab is a complete management module.",
			position: "bottom",
			icon: "📑",
		},
		{
			target: '[data-tour="school-content"]',
			title: "Tab Content Area",
			description: "This is where the action happens! Each tab opens its own management interface — add, edit, delete, and organize all your school data here.",
			position: "top",
			icon: "⚙️",
		},
	],
	"/dashboard/settings": [
		{
			target: '[data-tour="settings-header"]',
			title: "Settings Hub",
			description: "Welcome to your settings. Manage your appearance, profile, security, and preferences — all in one place.",
			position: "bottom",
			icon: "⚙️",
		},
		{
			target: '[data-tour="settings-appearance"]',
			title: "Appearance Studio",
			description: "Pick a theme that suits your style! Choose from Aurora Indigo, Verdant Emerald, Celestial Ocean, Sunset Ember, or Midnight Neon. Changes apply instantly across your entire dashboard.",
			position: "bottom",
			icon: "🎨",
		},
		{
			target: '[data-tour="settings-cards"]',
			title: "Account & Profile",
			description: "Quick links to manage your user profile, school profile, security settings, and personal preferences.",
			position: "top",
			icon: "👤",
		},
		{
			target: '[data-tour="settings-help"]',
			title: "Need Help?",
			description: "Stuck or have questions? Reach out to the support team directly from here for any account or settings issues.",
			position: "top",
			icon: "💬",
		},
	],
};

export function getTourSteps(role) {
	return TOUR_STEPS[role] || TOUR_STEPS.student;
}

export function getPageTourSteps(pathname) {
	return PAGE_TOURS[pathname] || null;
}
