import { createSupabaseServerClient } from "@/lib/supabase/server";

type Row = Record<string, any>;

export type WebinarSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  venue: string;
  sponsorTier: string;
  hotelSponsor: string | null;
  capacity: number;
  seatsRemaining: number;
  price: number;
  isPremium: boolean;
  deadline: string | null;
  startsAt: string | null;
  heroImageUrl: string | null;
  promoVideoUrl: string | null;
};

export type WebinarDetail = WebinarSummary & {
  agenda: {
    id: string;
    time: string | null;
    topic: string;
    speakerName: string;
    speakerLinkedin: string | null;
    speakerImageUrl: string | null;
  }[];
  faqs: {
    id: string;
    question: string;
    answer: string;
  }[];
  sponsors: {
    id: string;
    tier: string;
    name: string;
    logoUrl: string | null;
    linkUrl: string | null;
  }[];
  registrations: number;
};

export type AlgoSummary = {
  id: string;
  slug: string;
  name: string;
  description: string;
  riskClass: string;
  monthlyRoi: number;
  minCapital: number;
  price: number;
  isActive: boolean;
  complianceDisclaimer: string;
  imageUrl: string | null;
};

export type AlgoDetail = AlgoSummary & {
  snapshots: {
    id: string;
    periodStart: string;
    periodEnd: string;
    roiPct: number;
    drawdownPct: number;
  }[];
};

export type CourseSummary = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  lessonCount: number;
  planRequired: string;
};

export type CourseDetail = CourseSummary & {
  lessons: {
    id: string;
    title: string;
    sortOrder: number;
    durationMinutes: number | null;
    videoUrl: string | null;
    pdfUrl: string | null;
    isFree: boolean;
  }[];
};

export type BlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  publishedAt: string | null;
  authorName: string;
  featuredImageUrl: string | null;
};

export type ReviewSummary = {
  id: string;
  companyName: string;
  quote: string;
  videoUrl: string | null;
  brokerEndorsement: string | null;
  isFeatured: boolean;
};

export type DashboardSummary = {
  webinarRegistrations: number;
  activeLicenses: number;
  completedLessons: number;
  totalLessonsTracked: number;
};

export type AdminSummary = {
  totalUsers: number;
  activeUsers: number;
  webinarRegistrations: number;
  algoLicensesSold: number;
  courseEnrollments: number;
  expiringLicenses: number;
  revenueUsd: number;
};

export type CrmUser = {
  id: string;
  email: string;
  role: string;
  createdAt: string | null;
};

export type LicenseRow = {
  id: string;
  algoId: string;
  algoName: string;
  status: string;
  startsAt: string | null;
  expiresAt: string | null;
};

export type CourseProgressRow = {
  lessonId: string;
  courseTitle: string;
  lessonTitle: string;
  completedAt: string | null;
};

const FALLBACK_WEBINARS: WebinarSummary[] = [
  {
    id: "w1",
    slug: "q2-policy-divergence-briefing",
    title: "Q2 Policy Divergence Briefing",
    description:
      "Institutional macro briefing on rates divergence, FX dispersion, and cross-asset liquidity conditions.",
    venue: "IFX Capital Forum, London",
    sponsorTier: "PLATINUM",
    hotelSponsor: "Harbor Grand",
    capacity: 220,
    seatsRemaining: 63,
    price: 0,
    isPremium: false,
    deadline: new Date(Date.now() + 6 * 86400000).toISOString(),
    startsAt: new Date(Date.now() + 9 * 86400000).toISOString(),
    heroImageUrl: null,
    promoVideoUrl: null,
  },
  {
    id: "w2",
    slug: "institutional-risk-governance-webinar",
    title: "Institutional Risk Governance Session",
    description:
      "Premium roundtable on model drift, drawdown governance, and execution surveillance frameworks.",
    venue: "IFX Digital Broadcast Studio",
    sponsorTier: "GOLD",
    hotelSponsor: null,
    capacity: 90,
    seatsRemaining: 18,
    price: 299,
    isPremium: true,
    deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
    startsAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    heroImageUrl: null,
    promoVideoUrl: null,
  },
];

const FALLBACK_ALGOS: AlgoSummary[] = [
  {
    id: "a1",
    slug: "macro-execution-suite",
    name: "IFX Macro Execution Suite",
    description:
      "Multi-factor execution model focused on major FX pairs with strict regime detection and exposure controls.",
    riskClass: "MEDIUM",
    monthlyRoi: 4.2,
    minCapital: 25000,
    price: 1490,
    isActive: true,
    complianceDisclaimer:
      "Past performance does not guarantee future returns. Institutional risk controls remain mandatory.",
    imageUrl: null,
  },
  {
    id: "a2",
    slug: "volatility-mean-reversion",
    name: "IFX Volatility Mean Reversion",
    description:
      "Short-horizon volatility normalization model for liquid indices with bounded intraday risk envelopes.",
    riskClass: "HIGH",
    monthlyRoi: 6.1,
    minCapital: 50000,
    price: 2490,
    isActive: true,
    complianceDisclaimer:
      "Strategy suitability depends on mandate, liquidity profile, and risk budget.",
    imageUrl: null,
  },
];

const FALLBACK_COURSES: CourseSummary[] = [
  {
    id: "c1",
    slug: "macro-structure-foundations",
    title: "Macro Structure Foundations",
    category: "BEGINNER",
    description:
      "Core framework for rates, inflation, and currency transmission dynamics.",
    lessonCount: 14,
    planRequired: "free",
  },
  {
    id: "c2",
    slug: "institutional-execution-architecture",
    title: "Institutional Execution Architecture",
    category: "INSTITUTIONAL",
    description:
      "Execution logic, risk architecture, and portfolio-level governance for institutional deployment.",
    lessonCount: 22,
    planRequired: "premium",
  },
];

const FALLBACK_BLOG: BlogPostSummary[] = [
  {
    id: "b1",
    title: "Liquidity Regimes and Institutional Positioning",
    slug: "liquidity-regimes-institutional-positioning",
    excerpt:
      "A framework for measuring policy-led liquidity shifts and cross-asset positioning.",
    body: "Institutional capital remains sensitive to policy signaling and term-premium repricing.",
    category: "Macro",
    publishedAt: new Date().toISOString(),
    authorName: "IFX Research Desk",
    featuredImageUrl: null,
  },
  {
    id: "b2",
    title: "FX Volatility Compression and Systematic Flows",
    slug: "fx-volatility-compression-systematic-flows",
    excerpt:
      "How implied-realized spreads influence model expectancy, sizing, and execution quality.",
    body: "Model quality in low-volatility windows depends on strict execution discipline.",
    category: "FX",
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    authorName: "IFX Research Desk",
    featuredImageUrl: null,
  },
];

const FALLBACK_REVIEWS: ReviewSummary[] = [
  {
    id: "r1",
    companyName: "Northbridge Capital",
    quote:
      "IFXTrades provides structured institutional communication with clear risk framing and disciplined research notes.",
    videoUrl: null,
    brokerEndorsement:
      "Execution quality and governance process are both above market average.",
    isFeatured: true,
  },
  {
    id: "r2",
    companyName: "Riverton Multi-Asset",
    quote:
      "The algorithm licensing model is transparent, controlled, and aligned with professional capital standards.",
    videoUrl: null,
    brokerEndorsement: null,
    isFeatured: false,
  },
];

function asString(row: Row, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return fallback;
}

function asNumber(row: Row, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^0-9.-]/g, ""));
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return fallback;
}

function asBoolean(row: Row, keys: string[], fallback = false) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }
  }
  return fallback;
}

function asIso(row: Row, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
  }
  return null;
}

async function firstSuccessfulRows(tableNames: string[], limit = 50) {
  const supabase = await createSupabaseServerClient();
  for (const table of tableNames) {
    const { data, error } = await supabase.from(table).select("*").limit(limit);
    if (!error && Array.isArray(data)) {
      return data;
    }
  }
  return [];
}

async function firstSuccessfulCount(
  tableNames: string[],
  apply?: (query: any) => any,
) {
  const supabase = await createSupabaseServerClient();
  for (const table of tableNames) {
    let query = supabase.from(table).select("*", { head: true, count: "exact" });
    query = apply ? apply(query) : query;
    const { count, error } = await query;
    if (!error) {
      return count ?? 0;
    }
  }
  return 0;
}

export async function listWebinars() {
  const rows = await firstSuccessfulRows(["webinars"], 36);
  if (!rows.length) {
    return FALLBACK_WEBINARS;
  }

  const supabase = await createSupabaseServerClient();
  const mapped = await Promise.all(
    rows.map(async (row): Promise<WebinarSummary> => {
      const id = asString(row, ["id"], crypto.randomUUID());
      const capacity = asNumber(row, ["capacity"], 0);
      const { count } = await supabase
        .from("webinar_registrations")
        .select("*", { head: true, count: "exact" })
        .eq("webinar_id", id)
        .eq("status", "confirmed");

      const registrations = count ?? 0;
      return {
        id,
        slug: asString(row, ["slug"], id),
        title: asString(row, ["title"], "Institutional Webinar"),
        description: asString(row, ["description"], "Institutional event."),
        venue: asString(row, ["venue"], "TBA"),
        sponsorTier: asString(row, ["sponsor_tier"], "GOLD"),
        hotelSponsor: asString(row, ["hotel_sponsor"]) || null,
        capacity,
        seatsRemaining: Math.max(capacity - registrations, 0),
        price: asNumber(row, ["price"], 0),
        isPremium: asBoolean(row, ["is_premium"], false),
        deadline: asIso(row, ["registration_deadline"]),
        startsAt: asIso(row, ["starts_at", "created_at"]),
        heroImageUrl: asString(row, ["hero_image_url"]) || null,
        promoVideoUrl: asString(row, ["promo_video_url"]) || null,
      };
    }),
  );

  return mapped.sort((a, b) => {
    const aDate = a.startsAt ? new Date(a.startsAt).getTime() : 0;
    const bDate = b.startsAt ? new Date(b.startsAt).getTime() : 0;
    return aDate - bDate;
  });
}

export async function getWebinarBySlug(slug: string): Promise<WebinarDetail | null> {
  const webinars = await listWebinars();
  const webinar = webinars.find((item) => item.slug === slug);
  if (!webinar) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const [agenda, faqs, sponsors, regCount] = await Promise.all([
    supabase
      .from("webinar_agenda_items")
      .select("*")
      .eq("webinar_id", webinar.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("webinar_faqs")
      .select("*")
      .eq("webinar_id", webinar.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("webinar_sponsors")
      .select("*")
      .eq("webinar_id", webinar.id),
    supabase
      .from("webinar_registrations")
      .select("*", { head: true, count: "exact" })
      .eq("webinar_id", webinar.id)
      .eq("status", "confirmed"),
  ]);

  return {
    ...webinar,
    agenda:
      agenda.data?.map((row: Row) => ({
        id: asString(row, ["id"], crypto.randomUUID()),
        time: asIso(row, ["time"]),
        topic: asString(row, ["topic"], "Session"),
        speakerName: asString(row, ["speaker_name"], "IFX Speaker"),
        speakerLinkedin: asString(row, ["speaker_linkedin"]) || null,
        speakerImageUrl: asString(row, ["speaker_image_url"]) || null,
      })) ?? [],
    faqs:
      faqs.data?.map((row: Row) => ({
        id: asString(row, ["id"], crypto.randomUUID()),
        question: asString(row, ["question"], "Question"),
        answer: asString(row, ["answer"], "Answer"),
      })) ?? [],
    sponsors:
      sponsors.data?.map((row: Row) => ({
        id: asString(row, ["id"], crypto.randomUUID()),
        tier: asString(row, ["tier"], "SILVER"),
        name: asString(row, ["name"], "Partner"),
        logoUrl: asString(row, ["logo_url"]) || null,
        linkUrl: asString(row, ["link_url"]) || null,
      })) ?? [],
    registrations: regCount.count ?? 0,
  };
}

export async function listAlgos() {
  const rows = await firstSuccessfulRows(["algorithms", "algos"], 36);
  if (!rows.length) {
    return FALLBACK_ALGOS;
  }

  return rows
    .map(
      (row): AlgoSummary => ({
        id: asString(row, ["id"], crypto.randomUUID()),
        slug: asString(row, ["slug"], asString(row, ["id"], "algo")),
        name: asString(row, ["name", "title"], "Institutional Strategy"),
        description: asString(row, ["description"], "Institutional strategy."),
        riskClass: asString(
          row,
          ["risk_classification", "risk_level"],
          "MEDIUM",
        ),
        monthlyRoi: asNumber(row, ["monthly_roi_pct", "monthly_roi"], 0),
        minCapital: asNumber(row, ["min_capital", "min_investment"], 0),
        price: asNumber(row, ["price"], 0),
        isActive: asBoolean(row, ["is_active"], true),
        complianceDisclaimer: asString(
          row,
          ["compliance_disclaimer"],
          "Past performance is not indicative of future results.",
        ),
        imageUrl: asString(row, ["image_url"]) || null,
      }),
    )
    .filter((item) => item.isActive);
}

export async function getAlgoBySlug(slug: string): Promise<AlgoDetail | null> {
  const algos = await listAlgos();
  const algo = algos.find((item) => item.slug === slug);
  if (!algo) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("algo_performance_snapshots")
    .select("*")
    .eq("algo_id", algo.id)
    .order("period_start", { ascending: true });

  return {
    ...algo,
    snapshots:
      data?.map((row: Row) => ({
        id: asString(row, ["id"], crypto.randomUUID()),
        periodStart: asString(row, ["period_start"], ""),
        periodEnd: asString(row, ["period_end"], ""),
        roiPct: asNumber(row, ["roi_pct"], 0),
        drawdownPct: asNumber(row, ["drawdown_pct"], 0),
      })) ?? [],
  };
}

export async function listCourses() {
  const courseRows = await firstSuccessfulRows(["university_courses", "courses"], 40);
  if (!courseRows.length) {
    return FALLBACK_COURSES;
  }

  const lessons = await firstSuccessfulRows(["course_lessons", "lessons"], 500);
  const lessonCount = new Map<string, number>();
  for (const lesson of lessons) {
    const key = asString(lesson, ["course_id"]);
    lessonCount.set(key, (lessonCount.get(key) ?? 0) + 1);
  }

  return courseRows.map((course): CourseSummary => {
    const id = asString(course, ["id"], crypto.randomUUID());
    return {
      id,
      slug: asString(course, ["slug"], id),
      title: asString(course, ["title"], "Institutional Course"),
      category: asString(course, ["category"], "INTERMEDIATE"),
      description: asString(course, ["description"], "Structured syllabus."),
      lessonCount: lessonCount.get(id) ?? 0,
      planRequired: asString(course, ["plan_required"], "free"),
    };
  });
}

export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  const courses = await listCourses();
  const course = courses.find((item) => item.slug === slug);
  if (!course) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("course_lessons")
    .select("*")
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });

  return {
    ...course,
    lessons:
      data?.map((row: Row) => ({
        id: asString(row, ["id"], crypto.randomUUID()),
        title: asString(row, ["title"], "Lesson"),
        sortOrder: asNumber(row, ["sort_order"], 0),
        durationMinutes:
          typeof row.duration_minutes === "number" ? row.duration_minutes : null,
        videoUrl: asString(row, ["video_url"]) || null,
        pdfUrl: asString(row, ["pdf_url"]) || null,
        isFree: asBoolean(row, ["is_free"], false),
      })) ?? [],
  };
}

export async function listBlogPosts(category = "all") {
  const rows = await firstSuccessfulRows(["blog_posts"], 80);
  const source = rows.length ? rows : FALLBACK_BLOG;

  const mapped = source.map(
    (row): BlogPostSummary => ({
      id: asString(row, ["id"], crypto.randomUUID()),
      title: asString(row, ["title"], "IFX Research Update"),
      slug: asString(row, ["slug"], asString(row, ["id"], "insight")),
      excerpt: asString(row, ["excerpt"], "").slice(0, 220),
      body: asString(row, ["body", "content"], ""),
      category: asString(row, ["category", "name"], "Macro"),
      publishedAt: asIso(row, ["published_at", "created_at"]),
      authorName: asString(row, ["author_name"], "IFX Research Desk"),
      featuredImageUrl: asString(row, ["featured_image_url", "featured_image"]) || null,
    }),
  );

  if (category.toLowerCase() === "all") {
    return mapped.sort((a, b) => {
      const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bDate - aDate;
    });
  }

  return mapped.filter((item) => item.category.toLowerCase() === category.toLowerCase());
}

export async function getBlogPostBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!error && data) {
    return {
      id: asString(data, ["id"], slug),
      title: asString(data, ["title"], "IFX Research Update"),
      slug: asString(data, ["slug"], slug),
      excerpt: asString(data, ["excerpt"], ""),
      body: asString(data, ["body", "content"], ""),
      category: asString(data, ["category"], "Macro"),
      publishedAt: asIso(data, ["published_at", "created_at"]),
      authorName: asString(data, ["author_name"], "IFX Research Desk"),
      featuredImageUrl: asString(data, ["featured_image_url", "featured_image"]) || null,
    } as BlogPostSummary;
  }

  return (await listBlogPosts("all")).find((item) => item.slug === slug) ?? null;
}

export async function listReviews() {
  const rows = await firstSuccessfulRows(["reviews"], 50);
  const source = rows.length ? rows : FALLBACK_REVIEWS;

  return source.map(
    (row): ReviewSummary => ({
      id: asString(row, ["id"], crypto.randomUUID()),
      companyName: asString(row, ["company_name", "company"], "Institutional Partner"),
      quote: asString(row, ["quote"], "Institutional-quality delivery."),
      videoUrl: asString(row, ["video_url"]) || null,
      brokerEndorsement: asString(row, ["broker_endorsement"]) || null,
      isFeatured: asBoolean(row, ["is_featured"], false),
    }),
  );
}

export async function getUserLicenses(userId: string): Promise<LicenseRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("algo_licenses")
    .select("id, algo_id, status, starts_at, expires_at, algorithms(name)")
    .eq("user_id", userId)
    .order("expires_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    algoId: row.algo_id,
    algoName: row.algorithms?.name ?? "Algorithm",
    status: row.status,
    startsAt: row.starts_at ?? null,
    expiresAt: row.expires_at ?? null,
  }));
}

export async function getUserCourseProgress(
  userId: string,
): Promise<CourseProgressRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed_at, course_lessons(title, university_courses(title))")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row: any) => ({
    lessonId: row.lesson_id,
    lessonTitle: row.course_lessons?.title ?? "Lesson",
    courseTitle: row.course_lessons?.university_courses?.title ?? "Course",
    completedAt: row.completed_at ?? null,
  }));
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const webinarRegistrations = await firstSuccessfulCount(
    ["webinar_registrations"],
    (query) => query.eq("user_id", userId),
  );
  const activeLicenses = await firstSuccessfulCount(
    ["algo_licenses"],
    (query) => query.eq("user_id", userId).eq("status", "active"),
  );
  const progress = await getUserCourseProgress(userId);

  return {
    webinarRegistrations,
    activeLicenses,
    completedLessons: progress.filter((item) => !!item.completedAt).length,
    totalLessonsTracked: progress.length,
  };
}

export async function listCrmUsers(limit = 100): Promise<CrmUser[]> {
  const rows = await firstSuccessfulRows(["profiles"], limit);
  return rows.map((row): CrmUser => ({
    id: asString(row, ["id"], ""),
    email: asString(row, ["email"], "unknown@ifxtrades.com"),
    role: asString(row, ["role"], "USER"),
    createdAt: asIso(row, ["created_at"]),
  }));
}

export async function getAdminSummary(): Promise<AdminSummary> {
  const users = await listCrmUsers(1000);
  const webinarRegistrations = await firstSuccessfulCount(["webinar_registrations"]);
  const algoLicensesSold = await firstSuccessfulCount(["algo_licenses"]);
  const courseEnrollments = await firstSuccessfulCount(["course_enrollments"]);
  const expiringLicenses = await firstSuccessfulCount(
    ["algo_licenses"],
    (query) =>
      query
        .eq("status", "active")
        .lte("expires_at", new Date(Date.now() + 30 * 86400000).toISOString()),
  );

  const paymentRows = await firstSuccessfulRows(["payments", "revenue_events"], 500);
  const revenueUsd = paymentRows.reduce((sum, row) => sum + asNumber(row, ["amount"], 0), 0);

  return {
    totalUsers: users.length,
    activeUsers: users.length,
    webinarRegistrations,
    algoLicensesSold,
    courseEnrollments,
    expiringLicenses,
    revenueUsd,
  };
}
