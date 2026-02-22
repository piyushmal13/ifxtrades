import CrudManager from "@/components/admin/CrudManager";
import { listCourseLessons, listCourses } from "@/lib/data/platform";

export default async function AdminCourseLessonsPage() {
  const [lessonRows, courses] = await Promise.all([listCourseLessons(), listCourses()]);

  return (
    <CrudManager
      title="Course Lessons"
      description="Manage lesson ordering, duration, media URLs, and free access flags."
      endpoint="/api/admin/course-lessons"
      fields={[
        {
          name: "course_id",
          label: "Course",
          type: "select",
          required: true,
          options: courses.map((course) => ({ label: course.title, value: course.id })),
        },
        { name: "title", label: "Lesson Title", required: true },
        { name: "sort_order", label: "Sort Order", type: "number" },
        { name: "duration_minutes", label: "Duration (Minutes)", type: "number" },
        { name: "video_url", label: "Video URL" },
        { name: "pdf_url", label: "PDF URL" },
        { name: "is_free", label: "Free Lesson", type: "checkbox" },
      ]}
      rows={lessonRows}
      columns={[
        { key: "course_id", label: "Course ID" },
        { key: "title", label: "Title" },
        { key: "sort_order", label: "Order" },
        { key: "is_free", label: "Free" },
      ]}
    />
  );
}

