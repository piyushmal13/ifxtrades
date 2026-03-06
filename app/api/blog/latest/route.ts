import { NextResponse } from "next/server";
import { listBlogPosts } from "@/lib/data/platform";

export async function GET() {
    try {
        const posts = await listBlogPosts("all");
        return NextResponse.json(posts.slice(0, 5));
    } catch (error) {
        console.error("Failed to fetch latest posts for HUD:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}
