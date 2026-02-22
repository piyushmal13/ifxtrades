import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    <main className="min-h-screen bg-jpm-cream pt-28 pb-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-2">
          Course Detail
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-jpm-navy">{course.title}</h1>
        <p className="mt-5 text-sm text-jpm-muted leading-relaxed max-w-4xl">
          {course.description}
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Metric label="Category" value={course.category} />
          <Metric label="Lessons" value={`${course.lessonCount}`} />
          <Metric label="Plan Required" value={course.planRequired} />
        </div>

        <section className="card p-8 mt-8">
          <h2 className="font-serif text-2xl text-jpm-navy mb-5">Syllabus</h2>
          {course.lessons.length === 0 ? (
            <p className="text-sm text-jpm-muted">Lessons will be published shortly.</p>
          ) : (
            <ol className="space-y-4">
              {course.lessons.map((lesson, index) => (
                <li key={lesson.id} className="border border-jpm-border rounded-sm p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-jpm-navy">
                      {index + 1}. {lesson.title}
                    </p>
                    <p className="text-xs uppercase tracking-[0.12em] text-jpm-gold">
                      {lesson.isFree ? "Free" : "Locked"}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-jpm-muted uppercase tracking-[0.12em]">
                    {lesson.durationMinutes ? `${lesson.durationMinutes} minutes` : "Duration TBA"}
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
    <div className="card p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-jpm-muted">{label}</p>
      <p className="mt-2 font-semibold text-jpm-navy">{value}</p>
    </div>
  );
}
