import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { listCourses } from "@/lib/data/platform";

export const metadata = buildMetadata({
  title: "University",
  description:
    "Structured educational programs from foundational market mechanics to institutional deployment frameworks.",
  path: "/university",
});

export default async function UniversityPage() {
  const courses = await listCourses();

  return (
    <main className="min-h-screen bg-jpm-cream pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-2">
          Education System
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-jpm-navy">IFX University</h1>
        <p className="mt-5 text-sm text-jpm-muted max-w-3xl">
          Structured tracks designed for disciplined learning progression across
          beginner, intermediate, and institutional levels.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {courses.map((course) => (
            <article key={course.id} className="card p-7 flex flex-col">
              <p className="text-xs uppercase tracking-[0.14em] text-jpm-gold mb-2">
                {course.category}
              </p>
              <h2 className="font-serif text-2xl text-jpm-navy">{course.title}</h2>
              <p className="mt-3 text-sm text-jpm-muted leading-relaxed flex-1">
                {course.description}
              </p>
              <div className="mt-5 text-xs uppercase tracking-[0.12em] text-jpm-muted">
                <p>Lessons: {course.lessonCount}</p>
                <p>Plan: {course.planRequired}</p>
              </div>
              <Link href={`/university/${course.slug}`} className="btn-primary mt-6 w-fit">
                View Syllabus
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
