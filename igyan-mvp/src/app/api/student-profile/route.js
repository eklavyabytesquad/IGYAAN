import { NextResponse } from "next/server";
import { supabase } from "../../utils/supabase";

// GET - Fetch student profile
export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		const { data, error } = await supabase
			.from("student_profiles")
			.select("*")
			.eq("user_id", userId)
			.single();

		if (error && error.code !== "PGRST116") {
			// PGRST116 is "no rows returned"
			console.error("Error fetching profile:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		if (!data) {
			return NextResponse.json({ profile: null }, { status: 200 });
		}

		// Transform database format to component format
		const profile = {
			name: data.name,
			age: data.age,
			class: data.class,
			section: data.section,
			house: data.house || "",
			classTeacher: data.class_teacher || "",
			school: {
				name: data.school_name || "",
				location: data.school_location || "",
				board: data.school_board || "",
			},
			interests: data.interests || [],
			learningStyle: data.learning_style || "",
			strengths: data.strengths || [],
			growthAreas: data.growth_areas || [],
			academicGoals: data.academic_goals || [],
			recentWins: data.recent_wins || [],
			sleepTime: data.sleep_time || "",
			studySchedule: {
				weekday: data.study_schedule_weekday || "",
				weekend: data.study_schedule_weekend || "",
			},
			favoriteSubjects: data.favorite_subjects || [],
			mentors: [],
			funFact: data.fun_fact || "",
		};

		return NextResponse.json({ profile }, { status: 200 });
	} catch (error) {
		console.error("Error in GET /api/student-profile:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// POST - Create or update student profile
export async function POST(request) {
	try {
		const body = await request.json();
		const { userId, profile } = body;

		if (!userId || !profile) {
			return NextResponse.json(
				{ error: "User ID and profile data are required" },
				{ status: 400 }
			);
		}

		// Transform component format to database format
		const profileData = {
			user_id: userId,
			name: profile.name,
			age: profile.age,
			class: profile.class,
			section: profile.section,
			house: profile.house || null,
			class_teacher: profile.classTeacher || null,
			school_name: profile.school?.name || null,
			school_location: profile.school?.location || null,
			school_board: profile.school?.board || null,
			interests: profile.interests || [],
			learning_style: profile.learningStyle || null,
			strengths: profile.strengths || [],
			growth_areas: profile.growthAreas || [],
			academic_goals: profile.academicGoals || [],
			recent_wins: profile.recentWins || [],
			sleep_time: profile.sleepTime || null,
			study_schedule_weekday: profile.studySchedule?.weekday || null,
			study_schedule_weekend: profile.studySchedule?.weekend || null,
			favorite_subjects: profile.favoriteSubjects || [],
			fun_fact: profile.funFact || null,
			updated_at: new Date().toISOString(),
		};

		// Upsert profile
		const { data: profileResult, error: profileError } = await supabase
			.from("student_profiles")
			.upsert(profileData, {
				onConflict: "user_id",
			})
			.select()
			.single();

		if (profileError) {
			console.error("Error upserting profile:", profileError);
			return NextResponse.json(
				{ error: profileError.message },
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: "Profile saved successfully",
				profile: profileResult,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error in POST /api/student-profile:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}


