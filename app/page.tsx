export const dynamic = "force-dynamic";
import { buildMetadata } from "@/lib/seo";
import { listBlogPosts, listReviews } from "@/lib/data/platform";
import HomePageClient from "./HomePageClient";

export const metadata = buildMetadata({
  title: "Institutional Capital Intelligence",
  description:
    "Institutional webinars, algorithm licensing, structured university programs, and macro market intelligence.",
  path: "/",
});

export default async function HomePage() {
  const [posts, reviews] = await Promise.all([listBlogPosts("all"), listReviews()]);

  return <HomePageClient posts={posts} reviews={reviews} />;
}
