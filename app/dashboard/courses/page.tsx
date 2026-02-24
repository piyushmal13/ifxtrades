export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth";
import { getUserCourseProgress } from "@/lib/data/platform";

export default async function DashboardCoursesPage() {
  const { user } = await requireUser("/dashboard/courses");
  const progress = await getUserCourseProgress(user.id);

  return (
    <div className="text-white">
      <p className="text-[10px] uppercase tracking-[0.2em] text-jpm-gold mb-2">Courses</p>
      <h1 className="font-serif text-4xl">Learning Progress</h1>
      <p className="mt-4 text-sm text-white/45 max-w-2xl">
        Track lesson completion and enrollment momentum across structured
        university tracks.
      </p>

      {progress.length === 0 ? (
        <p className="card p-6 mt-8 text-sm text-white/55">
          No lesson progress tracked yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {progress.map((row) => (
            <li key={row.lessonId} className="card border border-white/10 bg-white/3 p-5">
              <p className="text-[10px] uppercase tracking-[0.12em] text-jpm-gold">
                {row.courseTitle}
              </p>
              <p className="font-semibold mt-1">{row.lessonTitle}</p>
              <p className="text-[10px] text-white/35 mt-1 uppercase tracking-[0.12em]">
                {row.completedAt
                  ? `Completed on ${new Date(row.completedAt).toLocaleDateString()}`
                  : "In progress"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
