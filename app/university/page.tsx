export const dynamic = "force-dynamic";

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
    <main className="min-h-screen bg-[#020617] pt-28 pb-20 px-6 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,55,0.06),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <p className="text-[10px] uppercase tracking-[0.28em] text-jpm-gold/70 mb-3">
          Education System
        </p>
        <h1 className="font-serif text-4xl md:text-5xl tracking-[-0.01em]">
          IFX University
        </h1>
        <p className="mt-4 text-sm text-white/45 max-w-3xl leading-relaxed">
          Structured tracks designed for disciplined learning progression across
          beginner, intermediate, and institutional levels.
        </p>

        {courses.length === 0 ? (
          <p className="card p-6 mt-12 text-sm text-white/55">
            No courses are available right now.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {courses.map((course) => (
              <article
                key={course.id}
                className="card relative overflow-hidden border border-white/8 bg-white/3 p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-jpm-gold/40 hover:shadow-[0_20px_50px_rgba(212,175,55,0.08)]"
              >
                <p className="text-[10px] uppercase tracking-[0.14em] text-jpm-gold mb-3">
                  {course.category}
                </p>
                <h2 className="font-serif text-2xl leading-snug">{course.title}</h2>
                <p className="mt-3 text-sm text-white/50 leading-relaxed flex-1">
                  {course.description}
                </p>
                <div className="mt-5 text-[10px] uppercase tracking-[0.12em] text-white/35">
                  <p>Lessons: {course.lessonCount}</p>
                  <p>Plan: {course.planRequired}</p>
                </div>
                <Link
                  href={`/university/${course.slug}`}
                  className="inline-flex items-center gap-1 mt-6 text-[10px] uppercase tracking-[0.16em] text-jpm-gold/70 hover:text-jpm-gold transition-colors"
                >
                  View Syllabus <span>-&gt;</span>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
