import Link from "next/link";
import { type Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { listCourses } from "@/lib/data/platform";

export const metadata: Metadata = buildMetadata({
  title: "University",
  description:
    "Structured educational programs from foundational market mechanics to institutional deployment frameworks.",
  path: "/university",
});

export default async function UniversityPage() {
  const courses = await listCourses();

  return (
    <main className="ifx-page-shell">
      <div className="ifx-page-container relative">
        <div className="animate-cinematic">
          <p className="text-[10px] uppercase tracking-[0.28em] text-jpm-gold/70 mb-3">
            Education System
          </p>
          <h1 className="font-serif text-4xl md:text-5xl tracking-[-0.01em] text-glow-gold">
            IFX University
          </h1>
          <p className="mt-4 text-sm text-white/45 max-w-3xl leading-relaxed">
            Structured tracks designed for disciplined learning progression across
            beginner, intermediate, and institutional levels.
          </p>
        </div>

        {courses.length === 0 ? (
          <p className="glass-premium p-6 mt-12 text-sm text-white/55 animate-cinematic" style={{ animationDelay: "0.2s" }}>
            No courses are available right now.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {courses.map((course, idx) => (
              <Link key={course.id} href={`/university/${course.slug}`} className="group block animate-cinematic" style={{ animationDelay: `${0.2 + idx * 0.1}s` }}>
                <article
                  className="glass-premium relative overflow-hidden h-full border border-white/8 p-7 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:border-jpm-gold/40 hover:shadow-[0_20px_50px_rgba(212,175,55,0.12)]"
                >
                  <p className="text-[10px] uppercase tracking-[0.14em] text-jpm-gold mb-3">
                    {course.category}
                  </p>
                  <h2 className="font-serif text-2xl leading-snug group-hover:text-jpm-gold transition-colors">{course.title}</h2>
                  <p className="mt-3 text-sm text-white/50 leading-relaxed flex-1">
                    {course.description}
                  </p>
                  <div className="mt-8 flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-white/35">
                    <div>
                      <p>Lessons: {course.lessonCount}</p>
                      <p>Plan: {course.planRequired}</p>
                    </div>
                    <span className="text-jpm-gold/70 group-hover:text-jpm-gold transition-colors">
                      View Syllabus →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
