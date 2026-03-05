import { supabase } from "@/app/utils/supabase";
import { NextResponse } from "next/server";

// GET /api/blogs?type=igyan_blog|industry_insight&tag=AI&featured=true&slug=my-slug
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const tag = searchParams.get("tag");
    const featured = searchParams.get("featured");
    const slug = searchParams.get("slug");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const offset = (page - 1) * limit;

    // Single blog by slug
    if (slug) {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 });
      }

      // Increment view count
      await supabase
        .from("blogs")
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq("id", data.id);

      return NextResponse.json({ blog: data });
    }

    // List blogs with filters
    let query = supabase
      .from("blogs")
      .select("*", { count: "exact" })
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq("blog_type", type);
    }

    if (featured === "true") {
      query = query.eq("is_featured", true);
    }

    if (tag) {
      query = query.contains("tags", [tag]);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      blogs: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/blogs - Create a new blog
export async function POST(request) {
  try {
    const body = await request.json();

    // Generate slug from title if not provided
    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Set published_at if publishing
    if (body.is_published && !body.published_at) {
      body.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("blogs")
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ blog: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/blogs - Update a blog
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Blog id is required" }, { status: 400 });
    }

    // Set published_at if publishing for the first time
    if (updates.is_published && !updates.published_at) {
      updates.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("blogs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ blog: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/blogs?id=xxx
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Blog id is required" }, { status: 400 });
    }

    const { error } = await supabase.from("blogs").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
