// Dummy Faculty Data with 25 members
export const facultyData = [
	// Science Teachers (5)
	{
		id: "F001",
		name: "Dr. Rajesh Kumar",
		subject: "Science",
		classes: ["6A", "6B", "7A"],
		experience: 15,
		specialization: "Physics",
		qualifications: ["M.Sc. Physics", "B.Ed.", "Ph.D."],
		availability: generateAvailability(0.85), // 85% available
		preferredPeriods: ["1", "2", "3", "4"],
		maxSubstitutionsPerWeek: 5,
		currentSubstitutions: 2,
	},
	{
		id: "F002",
		name: "Mrs. Priya Sharma",
		subject: "Science",
		classes: ["8A", "8B", "9A"],
		experience: 12,
		specialization: "Chemistry",
		qualifications: ["M.Sc. Chemistry", "B.Ed."],
		availability: generateAvailability(0.9),
		preferredPeriods: ["2", "3", "4", "5"],
		maxSubstitutionsPerWeek: 4,
		currentSubstitutions: 1,
	},
	{
		id: "F003",
		name: "Mr. Amit Patel",
		subject: "Science",
		classes: ["7B", "8C", "9B"],
		experience: 8,
		specialization: "Biology",
		qualifications: ["M.Sc. Biology", "B.Ed."],
		availability: generateAvailability(0.8),
		preferredPeriods: ["3", "4", "5", "6"],
		maxSubstitutionsPerWeek: 6,
		currentSubstitutions: 3,
	},
	{
		id: "F004",
		name: "Dr. Sneha Verma",
		subject: "Science",
		classes: ["10A", "10B"],
		experience: 18,
		specialization: "Physics",
		qualifications: ["M.Sc. Physics", "B.Ed.", "Ph.D."],
		availability: generateAvailability(0.75),
		preferredPeriods: ["1", "2", "5", "6"],
		maxSubstitutionsPerWeek: 3,
		currentSubstitutions: 1,
	},
	{
		id: "F005",
		name: "Mr. Vikram Singh",
		subject: "Science",
		classes: ["6C", "7C", "8D"],
		experience: 10,
		specialization: "General Science",
		qualifications: ["M.Sc.", "B.Ed."],
		availability: generateAvailability(0.88),
		preferredPeriods: ["2", "3", "4", "7"],
		maxSubstitutionsPerWeek: 5,
		currentSubstitutions: 2,
	},

	// Mathematics Teachers (5)
	{
		id: "F006",
		name: "Mrs. Kavita Desai",
		subject: "Mathematics",
		classes: ["6A", "6B", "7A"],
		experience: 14,
		specialization: "Algebra",
		qualifications: ["M.Sc. Mathematics", "B.Ed."],
		availability: generateAvailability(0.92),
		preferredPeriods: ["1", "2", "3", "4"],
		maxSubstitutionsPerWeek: 4,
		currentSubstitutions: 1,
	},
	{
		id: "F007",
		name: "Mr. Suresh Reddy",
		subject: "Mathematics",
		classes: ["8A", "9A", "10A"],
		experience: 20,
		specialization: "Calculus",
		qualifications: ["M.Sc. Mathematics", "B.Ed.", "M.Phil."],
		availability: generateAvailability(0.7),
		preferredPeriods: ["1", "2", "3"],
		maxSubstitutionsPerWeek: 3,
		currentSubstitutions: 2,
	},
	{
		id: "F008",
		name: "Mrs. Anita Joshi",
		subject: "Mathematics",
		classes: ["7B", "8B", "9B"],
		experience: 9,
		specialization: "Geometry",
		qualifications: ["M.Sc. Mathematics", "B.Ed."],
		availability: generateAvailability(0.87),
		preferredPeriods: ["3", "4", "5", "6"],
		maxSubstitutionsPerWeek: 5,
		currentSubstitutions: 2,
	},
	{
		id: "F009",
		name: "Mr. Rahul Gupta",
		subject: "Mathematics",
		classes: ["6C", "7C", "8C"],
		experience: 11,
		specialization: "Statistics",
		qualifications: ["M.Sc. Statistics", "B.Ed."],
		availability: generateAvailability(0.85),
		preferredPeriods: ["2", "3", "4", "5"],
		maxSubstitutionsPerWeek: 4,
		currentSubstitutions: 1,
	},
	{
		id: "F010",
		name: "Dr. Meera Iyer",
		subject: "Mathematics",
		classes: ["9C", "10B", "10C"],
		experience: 16,
		specialization: "Pure Mathematics",
		qualifications: ["M.Sc. Mathematics", "B.Ed.", "Ph.D."],
		availability: generateAvailability(0.78),
		preferredPeriods: ["1", "2", "5", "6"],
		maxSubstitutionsPerWeek: 3,
		currentSubstitutions: 0,
	},

	// English Teachers (4)
	{
		id: "F011",
		name: "Ms. Sarah Thomas",
		subject: "English",
		classes: ["6A", "7A", "8A"],
		experience: 13,
		specialization: "Literature",
		qualifications: ["M.A. English", "B.Ed."],
		availability: generateAvailability(0.9),
		preferredPeriods: ["1", "2", "3", "4"],
		maxSubstitutionsPerWeek: 5,
		currentSubstitutions: 2,
	},
	{
		id: "F012",
		name: "Mr. John D'Souza",
		subject: "English",
		classes: ["9A", "10A", "10B"],
		experience: 17,
		specialization: "Grammar & Writing",
		qualifications: ["M.A. English", "B.Ed.", "M.Phil."],
		availability: generateAvailability(0.82),
		preferredPeriods: ["2", "3", "4", "5"],
		maxSubstitutionsPerWeek: 4,
		currentSubstitutions: 1,
	},
	{
		id: "F013",
		name: "Mrs. Deepa Menon",
		subject: "English",
		classes: ["6B", "7B", "8B"],
		experience: 10,
		specialization: "Communication",
		qualifications: ["M.A. English", "B.Ed."],
		availability: generateAvailability(0.88),
		preferredPeriods: ["3", "4", "5", "6"],
		maxSubstitutionsPerWeek: 5,
		currentSubstitutions: 3,
	},
	{
		id: "F014",
		name: "Mr. Michael Rodriguez",
		subject: "English",
		classes: ["6C", "8C", "9B"],
		experience: 7,
		specialization: "Spoken English",
		qualifications: ["M.A. English", "B.Ed."],
		availability: generateAvailability(0.91),
		preferredPeriods: ["1", "2", "4", "7"],
		maxSubstitutionsPerWeek: 6,
		currentSubstitutions: 2,
	},

	// Hindi Teachers (3)
	{
		id: "F015",
		name: "Mrs. Sunita Agarwal",
		subject: "Hindi",
		classes: ["6A", "7A", "8A", "9A"],
		experience: 19,
		specialization: "Hindi Literature",
		qualifications: ["M.A. Hindi", "B.Ed."],
		availability: generateAvailability(0.86),
		preferredPeriods: ["1", "2", "3", "4"],
		maxSubstitutionsPerWeek: 4,
		currentSubstitutions: 1,
	},
	{
		id: "F016",
		name: "Mr. Ramesh Tiwari",
		subject: "Hindi",
		classes: ["6B", "7B", "8B", "10A"],
		experience: 12,
		specialization: "Hindi Grammar",
		qualifications: ["M.A. Hindi", "B.Ed."],
		availability: generateAvailability(0.89),
		preferredPeriods: ["2", "3", "4", "5"],
		maxSubstitutionsPerWeek: 5,
		currentSubstitutions: 2,
	},
	{
		id: "F017",
		name: "Mrs. Pooja Mishra",
		subject: "Hindi",
		classes: ["6C", "7C", "9B", "10B"],
		experience: 8,
		specialization: "Modern Hindi",
		qualifications: ["M.A. Hindi", "B.Ed."],
		availability: generateAvailability(0.84),
		preferredPeriods: ["3", "4", "5", "6"],
		maxSubstitutionsPerWeek: 5,
		currentSubstitutions: 1,
	},

	// Social Science Teachers (3)
	{
		id: "F018",
		name: "Dr. Ashok Nair",
		subject: "Social Science",
		classes: ["6A", "7A", "8A", "9A"],
		experience: 21,
		specialization: "History",
		qualifications: ["M.A. History", "B.Ed.", "Ph.D."],
		availability: generateAvailability(0.76),
		preferredPeriods: ["1", "2", "3"],
		maxSubstitutionsPerWeek: 3,
		currentSubstitutions: 1,
	},
	{
		id: "F019",
		name: "Mrs. Lakshmi Pillai",
		subject: "Social Science",
		classes: ["6B", "7B", "8B", "10A"],
		experience: 14,
		specialization: "Geography",
		qualifications: ["M.A. Geography", "B.Ed."],
		availability: generateAvailability(0.83),
		preferredPeriods: ["2", "3", "4", "5"],
		maxSubstitutionsPerWeek: 4,
		currentSubstitutions: 2,
	},
	{
		id: "F020",
		name: "Mr. Arun Bhatt",
		subject: "Social Science",
		classes: ["6C", "7C", "9B", "10B"],
		experience: 11,
		specialization: "Civics",
		qualifications: ["M.A. Political Science", "B.Ed."],
		availability: generateAvailability(0.87),
		preferredPeriods: ["3", "4", "5", "6"],
		maxSubstitutionsPerWeek: 5,
		currentSubstitutions: 1,
	},

	// Computer Science Teachers (2)
	{
		id: "F021",
		name: "Mr. Karthik Krishnan",
		subject: "Computer Science",
		classes: ["6A", "7A", "8A", "9A", "10A"],
		experience: 9,
		specialization: "Programming",
		qualifications: ["M.Tech. CSE", "B.Ed."],
		availability: generateAvailability(0.88),
		preferredPeriods: ["3", "4", "5", "6", "7"],
		maxSubstitutionsPerWeek: 5,
		currentSubstitutions: 2,
	},
	{
		id: "F022",
		name: "Ms. Divya Rao",
		subject: "Computer Science",
		classes: ["6B", "7B", "8B", "9B", "10B"],
		experience: 6,
		specialization: "Web Development",
		qualifications: ["M.C.A.", "B.Ed."],
		availability: generateAvailability(0.92),
		preferredPeriods: ["2", "3", "4", "5", "6"],
		maxSubstitutionsPerWeek: 6,
		currentSubstitutions: 1,
	},

	// Sports Teachers (2)
	{
		id: "F023",
		name: "Mr. Arjun Kapoor",
		subject: "Physical Education",
		classes: ["6A", "6B", "7A", "7B", "8A", "8B"],
		experience: 10,
		specialization: "Athletics",
		qualifications: ["M.P.Ed.", "B.P.Ed."],
		availability: generateAvailability(0.95),
		preferredPeriods: ["5", "6", "7", "8"],
		maxSubstitutionsPerWeek: 7,
		currentSubstitutions: 3,
	},
	{
		id: "F024",
		name: "Ms. Neha Chopra",
		subject: "Physical Education",
		classes: ["6C", "7C", "8C", "9A", "9B", "10A"],
		experience: 7,
		specialization: "Yoga & Fitness",
		qualifications: ["M.P.Ed.", "B.P.Ed."],
		availability: generateAvailability(0.93),
		preferredPeriods: ["1", "5", "6", "7", "8"],
		maxSubstitutionsPerWeek: 6,
		currentSubstitutions: 2,
	},

	// Library Teacher (1)
	{
		id: "F025",
		name: "Mrs. Rekha Sinha",
		subject: "Library",
		classes: ["6A", "6B", "6C", "7A", "7B", "7C", "8A", "8B", "8C"],
		experience: 15,
		specialization: "Library Science",
		qualifications: ["M.Lib.Sc.", "B.Ed."],
		availability: generateAvailability(0.94),
		preferredPeriods: ["2", "3", "4", "5", "6"],
		maxSubstitutionsPerWeek: 8,
		currentSubstitutions: 1,
	},
];

// Generate random availability for next 30 days, 8 periods each day
function generateAvailability(availabilityRate = 0.85) {
	const availability = {};
	const today = new Date();

	for (let i = 0; i < 30; i++) {
		const date = new Date(today);
		date.setDate(date.getDate() + i);
		const dateKey = date.toISOString().split("T")[0];

		availability[dateKey] = {};

		for (let period = 1; period <= 8; period++) {
			// Random availability based on rate
			availability[dateKey][period.toString()] = Math.random() < availabilityRate;
		}
	}

	return availability;
}

// Calculate matching score between absent faculty and potential substitute
function calculateMatchScore(absentFaculty, substitute, date, period) {
	let score = 0;
	const weights = {
		sameSubject: 40,
		relatedSubject: 20,
		classOverlap: 15,
		experience: 10,
		workload: 10,
		preferredPeriod: 10,
		specialization: 15,
	};

	// 1. Subject Match (Most Important)
	if (substitute.subject === absentFaculty.subject) {
		score += weights.sameSubject;
	} else if (isRelatedSubject(absentFaculty.subject, substitute.subject)) {
		score += weights.relatedSubject;
	}

	// 2. Class Overlap
	const classOverlap = absentFaculty.classes.filter((cls) =>
		substitute.classes.includes(cls)
	).length;
	score += (classOverlap / absentFaculty.classes.length) * weights.classOverlap;

	// 3. Experience Factor (normalized to 0-1)
	const experienceDiff = Math.abs(substitute.experience - absentFaculty.experience);
	const experienceScore = Math.max(0, 1 - experienceDiff / 20);
	score += experienceScore * weights.experience;

	// 4. Workload (lower is better)
	const workloadCapacity =
		(substitute.maxSubstitutionsPerWeek - substitute.currentSubstitutions) /
		substitute.maxSubstitutionsPerWeek;
	score += workloadCapacity * weights.workload;

	// 5. Preferred Period
	if (substitute.preferredPeriods.includes(period)) {
		score += weights.preferredPeriod;
	}

	// 6. Specialization Match
	if (
		substitute.specialization &&
		absentFaculty.specialization &&
		substitute.specialization === absentFaculty.specialization
	) {
		score += weights.specialization;
	}

	return Math.round(score);
}

// Check if subjects are related
function isRelatedSubject(subject1, subject2) {
	const relatedGroups = [
		["Science", "Mathematics"],
		["English", "Hindi", "Library"],
		["Social Science", "Library"],
		["Computer Science", "Mathematics"],
	];

	return relatedGroups.some(
		(group) => group.includes(subject1) && group.includes(subject2)
	);
}

// Generate detailed reasoning for substitution
async function generateReasoning(absentFaculty, substitute, score, matchDetails) {
	const prompt = `As an educational administrator, explain why ${substitute.name} (${substitute.subject} teacher) is the best substitute for ${absentFaculty.name} (${absentFaculty.subject} teacher).

Context:
- Match Score: ${score}/100
- Absent Faculty: ${absentFaculty.name}, ${absentFaculty.experience} years experience, teaches ${absentFaculty.classes.join(", ")}, specializes in ${absentFaculty.specialization || "general"}
- Substitute: ${substitute.name}, ${substitute.experience} years experience, teaches ${substitute.classes.join(", ")}, specializes in ${substitute.specialization || "general"}
- Current workload: ${substitute.currentSubstitutions}/${substitute.maxSubstitutionsPerWeek} substitutions this week
- Match Details: ${JSON.stringify(matchDetails)}

Provide a concise 2-3 sentence professional explanation focusing on:
1. Subject expertise compatibility
2. Teaching experience relevance
3. Classroom familiarity (if applicable)

Keep it brief and professional.`;

	try {
		const response = await fetch("/api/openai-reasoning", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ prompt }),
		});

		if (!response.ok) {
			throw new Error("Failed to generate reasoning");
		}

		const data = await response.json();
		return data.reasoning;
	} catch (error) {
		console.error("Error generating AI reasoning:", error);
		// Fallback reasoning
		return generateFallbackReasoning(absentFaculty, substitute, score, matchDetails);
	}
}

// Fallback reasoning if AI fails
function generateFallbackReasoning(absentFaculty, substitute, score, matchDetails) {
	let reasoning = `${substitute.name} is recommended as the best substitute with a match score of ${score}/100. `;

	if (substitute.subject === absentFaculty.subject) {
		reasoning += `As a fellow ${substitute.subject} teacher with ${substitute.experience} years of experience, they possess the exact subject expertise required. `;
	} else if (matchDetails.relatedSubject) {
		reasoning += `Their expertise in ${substitute.subject}, which is related to ${absentFaculty.subject}, provides a solid foundation for covering the class. `;
	}

	const classOverlap = absentFaculty.classes.filter((cls) =>
		substitute.classes.includes(cls)
	);
	if (classOverlap.length > 0) {
		reasoning += `They already teach ${classOverlap.join(", ")}, ensuring familiarity with the students and curriculum expectations. `;
	}

	if (substitute.currentSubstitutions < substitute.maxSubstitutionsPerWeek - 1) {
		reasoning += `With manageable workload (${substitute.currentSubstitutions}/${substitute.maxSubstitutionsPerWeek} substitutions this week), they can provide focused attention to the class.`;
	}

	return reasoning;
}

// Main substitution generation function
export async function generateSubstitution(absentFacultyId, date, period, allFaculty) {
	const absentFaculty = allFaculty.find((f) => f.id === absentFacultyId);

	if (!absentFaculty) {
		throw new Error("Absent faculty not found");
	}

	// Get available substitutes
	const availableSubstitutes = allFaculty.filter(
		(faculty) =>
			faculty.id !== absentFacultyId &&
			faculty.availability[date]?.[period] === true &&
			faculty.currentSubstitutions < faculty.maxSubstitutionsPerWeek
	);

	if (availableSubstitutes.length === 0) {
		throw new Error("No available substitutes found for this time slot");
	}

	// Calculate scores for all available substitutes
	const scoredSubstitutes = availableSubstitutes.map((substitute) => {
		const score = calculateMatchScore(absentFaculty, substitute, date, period);
		return { substitute, score };
	});

	// Sort by score descending
	scoredSubstitutes.sort((a, b) => b.score - a.score);

	// Get top 3 matches
	const top3Matches = scoredSubstitutes.slice(0, 3).map((item) => ({
		...item.substitute,
		matchScore: item.score,
	}));

	const bestMatch = top3Matches[0];

	// Generate match details
	const matchDetails = {
		sameSubject: bestMatch.subject === absentFaculty.subject,
		relatedSubject: isRelatedSubject(absentFaculty.subject, bestMatch.subject),
		classOverlap: absentFaculty.classes.filter((cls) =>
			bestMatch.classes.includes(cls)
		),
		experienceMatch: Math.abs(bestMatch.experience - absentFaculty.experience) <= 5,
		preferredPeriod: bestMatch.preferredPeriods.includes(period),
	};

	// Generate AI reasoning
	const reasoning = await generateReasoning(
		absentFaculty,
		bestMatch,
		bestMatch.matchScore,
		matchDetails
	);

	return {
		absentFaculty,
		bestMatch,
		alternativeMatches: top3Matches.slice(1),
		reasoning,
		matchDetails,
		date,
		period,
	};
}

// Generate class schedule for a specific date
export function generateClassSchedule(facultyData, date) {
	const schedule = {};
	const dateKey = date;
	
	// For each faculty member, generate their schedule
	facultyData.forEach(faculty => {
		// Each faculty teaches their assigned classes across different periods
		faculty.classes.forEach((className, index) => {
			// Distribute classes across 8 periods
			// Each class typically has 5-6 periods per week
			const periodsForClass = [
				(index % 4) + 1,  // Period 1-4
				((index + 2) % 4) + 5,  // Period 5-8
			];
			
			periodsForClass.forEach(period => {
				const scheduleEntry = {
					className,
					subject: faculty.subject,
					facultyId: faculty.id,
					facultyName: faculty.name,
					period: period.toString(),
					isAvailable: faculty.availability[dateKey]?.[period.toString()] || false,
				};
				
				if (!schedule[dateKey]) {
					schedule[dateKey] = [];
				}
				schedule[dateKey].push(scheduleEntry);
			});
		});
	});
	
	return schedule;
}

// Export subject categories for filtering
export const subjectCategories = {
	core: ["Science", "Mathematics", "English", "Hindi"],
	secondary: ["Social Science", "Computer Science"],
	support: ["Physical Education", "Library"],
};
