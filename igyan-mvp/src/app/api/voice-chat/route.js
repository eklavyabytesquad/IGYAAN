import { NextResponse } from "next/server";
import { supabase } from "../../utils/supabase";

// GET - Fetch all chats for a user
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
			.from("voice_chat_history")
			.select("*")
			.eq("user_id", userId)
			.order("updated_at", { ascending: false });

		if (error) {
			console.error("Error fetching chats:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ chats: data || [] }, { status: 200 });
	} catch (error) {
		console.error("Error in GET /api/voice-chat:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// POST - Create or update a chat
export async function POST(request) {
	try {
		const body = await request.json();
		const { userId, chatId, title, messages, selectedNotes } = body;

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		const chatData = {
			user_id: userId,
			title: title || "New Voice Chat",
			messages: messages || [],
			selected_notes: selectedNotes || null,
			updated_at: new Date().toISOString(),
		};

		let result;

		if (chatId) {
			// Update existing chat
			const { data, error } = await supabase
				.from("voice_chat_history")
				.update(chatData)
				.eq("id", chatId)
				.eq("user_id", userId)
				.select()
				.single();

			if (error) {
				console.error("Error updating chat:", error);
				return NextResponse.json({ error: error.message }, { status: 500 });
			}
			result = data;
		} else {
			// Create new chat
			const { data, error } = await supabase
				.from("voice_chat_history")
				.insert(chatData)
				.select()
				.single();

			if (error) {
				console.error("Error creating chat:", error);
				return NextResponse.json({ error: error.message }, { status: 500 });
			}
			result = data;
		}

		return NextResponse.json(
			{
				success: true,
				message: "Chat saved successfully",
				chat: result,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error in POST /api/voice-chat:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// DELETE - Delete a chat
export async function DELETE(request) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");
		const chatId = searchParams.get("chatId");

		if (!userId || !chatId) {
			return NextResponse.json(
				{ error: "User ID and Chat ID are required" },
				{ status: 400 }
			);
		}

		const { error } = await supabase
			.from("voice_chat_history")
			.delete()
			.eq("id", chatId)
			.eq("user_id", userId);

		if (error) {
			console.error("Error deleting chat:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(
			{ success: true, message: "Chat deleted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error in DELETE /api/voice-chat:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
