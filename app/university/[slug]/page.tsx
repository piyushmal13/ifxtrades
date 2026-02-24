import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { buildMetadata, courseJsonLd } from "@/lib/seo";
import { getCourseBySlug } from "@/lib/data/platform";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return buildMetadata({
      title: "Course Not Found",
      description: "Course unavailable.",
      path: `/university/${slug}`,
    });
  }

  return buildMetadata({
    title: course.title,
    description: course.description.slice(0, 150),
    path: `/university/${course.slug}`,
  });
}

export default async function CourseDetailPage({ params }: Params) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const jsonLd = courseJsonLd({
    name: course.title,
    description: course.description,
    url: `https://www.ifxtrades.com/university/${course.slug}`,
  });

  return (
    <main className="min-h-screen bg-[#020617] pt-28 pb-20 px-6 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,55,0.06),transparent)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <p className="text-[10px] uppercase tracking-[0.28em] text-jpm-gold/70 mb-3">
          Course Detail
        </p>
        <h1 className="font-serif text-4xl md:text-5xl tracking-[-0.01em]">
          {course.title}
        </h1>
        <p className="mt-4 text-sm text-white/45 leading-relaxed max-w-4xl">
          {course.description}
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Metric label="Category" value={course.category} />
          <Metric label="Lessons" value={`${course.lessonCount}`} />
          <Metric label="Plan Required" value={course.planRequired} />
        </div>

        <section className="card border border-white/10 bg-white/3 p-8 mt-8">
          <h2 className="font-serif text-2xl mb-5">Syllabus</h2>
          {course.lessons.length === 0 ? (
            <p className="text-sm text-white/55">Lessons will be published shortly.</p>
          ) : (
            <ol className="space-y-4">
              {course.lessons.map((lesson, index) => (
                <li key={lesson.id} className="border border-white/10 rounded-sm p-4 bg-white/2">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold">
                      {index + 1}. {lesson.title}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-jpm-gold">
                      {lesson.isFree ? "Free" : "Locked"}
                    </p>
                  </div>
                  <p className="mt-2 text-[10px] text-white/35 uppercase tracking-[0.12em]">
                    {lesson.durationMinutes
                      ? `${lesson.durationMinutes} minutes`
                      : "Duration TBA"}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card border border-white/10 bg-white/3 p-4">
      <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">{label}</p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}
