import type { MetadataRoute } from "next";
import { listAlgos, listBlogPosts, listCourses, listWebinars } from "@/lib/data/platform";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [webinars, algos, courses, posts] = await Promise.all([
    listWebinars(),
    listAlgos(),
    listCourses(),
    listBlogPosts("all"),
  ]);

  const base = "https://www.ifxtrades.com";
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/webinars`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/algos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/university`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/blog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/reviews`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/login`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/signup`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const webinarRoutes = webinars.map((webinar) => ({
    url: `${base}/webinars/${webinar.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const algoRoutes = algos.map((algo) => ({
    url: `${base}/algos/${algo.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const courseRoutes = courses.map((course) => ({
    url: `${base}/university/${course.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const blogRoutes = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticRoutes, ...webinarRoutes, ...algoRoutes, ...courseRoutes, ...blogRoutes];
}
