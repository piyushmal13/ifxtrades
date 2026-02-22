import { requireUser } from "@/lib/auth";
import { getUserCourseProgress } from "@/lib/data/platform";

export default async function DashboardCoursesPage() {
  const { user } = await requireUser("/dashboard/courses");
  const progress = await getUserCourseProgress(user.id);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-jpm-gold mb-2">Courses</p>
      <h1 className="font-serif text-4xl text-jpm-navy">Learning Progress</h1>
      <p className="mt-4 text-sm text-jpm-muted max-w-2xl">
        Track lesson completion and enrollment momentum across structured
        university tracks.
      </p>

      {progress.length === 0 ? (
        <p className="card p-6 mt-8 text-sm text-jpm-muted">
          No lesson progress tracked yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {progress.map((row) => (
            <li key={row.lessonId} className="card p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-jpm-gold">
                {row.courseTitle}
              </p>
              <p className="font-semibold text-jpm-navy mt-1">{row.lessonTitle}</p>
              <p className="text-xs text-jpm-muted mt-1">
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
