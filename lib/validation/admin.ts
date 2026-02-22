import { z } from "zod";

const optionalDateString = z.string().trim().min(1).optional().nullable();
const optionalText = z.string().trim().optional().nullable();

const nonEmptyUpdate = <T extends z.ZodRawShape>(shape: T) =>
  z
    .object(shape)
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required.",
    });

export const blogCreateSchema = z.object({
  title: z.string().trim().min(3),
  slug: z.string().trim().min(3),
  excerpt: z.string().trim().min(1).default(""),
  body: z.string().trim().min(1),
  category: z.string().trim().min(1).default("Macro"),
  meta_title: optionalText,
  meta_description: optionalText,
  published_at: optionalDateString,
});

export const blogUpdateSchema = nonEmptyUpdate({
  title: z.string().trim().min(3),
  slug: z.string().trim().min(3),
  excerpt: z.string().trim().min(1),
  body: z.string().trim().min(1),
  category: z.string().trim().min(1),
  meta_title: optionalText,
  meta_description: optionalText,
  published_at: optionalDateString,
});

export const webinarCreateSchema = z.object({
  title: z.string().trim().min(3),
  slug: z.string().trim().min(3),
  description: z.string().trim().min(1),
  venue: z.string().trim().min(1),
  sponsor_tier: z.string().trim().min(1).default("GOLD"),
  hotel_sponsor: optionalText,
  capacity: z.coerce.number().int().min(1).default(100),
  price: z.coerce.number().min(0).default(0),
  registration_deadline: optionalDateString,
  starts_at: optionalDateString,
  hero_image_url: optionalText,
  promo_video_url: optionalText,
  is_premium: z.coerce.boolean().default(false),
  is_published: z.coerce.boolean().default(false),
});

export const webinarUpdateSchema = nonEmptyUpdate({
  title: z.string().trim().min(3),
  slug: z.string().trim().min(3),
  description: z.string().trim().min(1),
  venue: z.string().trim().min(1),
  sponsor_tier: z.string().trim().min(1),
  hotel_sponsor: optionalText,
  capacity: z.coerce.number().int().min(1),
  price: z.coerce.number().min(0),
  registration_deadline: optionalDateString,
  starts_at: optionalDateString,
  hero_image_url: optionalText,
  promo_video_url: optionalText,
  is_premium: z.coerce.boolean(),
  is_published: z.coerce.boolean(),
});

export const algoCreateSchema = z.object({
  name: z.string().trim().min(3),
  slug: z.string().trim().min(3),
  description: z.string().trim().min(1),
  risk_classification: z.string().trim().min(1).default("MEDIUM"),
  monthly_roi_pct: z.coerce.number().default(0),
  min_capital: z.coerce.number().min(0).default(0),
  price: z.coerce.number().min(0).default(0),
  compliance_disclaimer: z
    .string()
    .trim()
    .min(1)
    .default("Past performance is not indicative of future results."),
  image_url: optionalText,
  is_active: z.coerce.boolean().default(true),
});

export const algoUpdateSchema = nonEmptyUpdate({
  name: z.string().trim().min(3),
  slug: z.string().trim().min(3),
  description: z.string().trim().min(1),
  risk_classification: z.string().trim().min(1),
  monthly_roi_pct: z.coerce.number(),
  min_capital: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
  compliance_disclaimer: z.string().trim().min(1),
  image_url: optionalText,
  is_active: z.coerce.boolean(),
});

export const universityCreateSchema = z.object({
  title: z.string().trim().min(3),
  slug: z.string().trim().min(3),
  category: z.string().trim().min(1),
  description: z.string().trim().min(1).default(""),
  plan_required: z.string().trim().min(1).default("free"),
  sort_order: z.coerce.number().int().default(0),
  is_published: z.coerce.boolean().default(false),
});

export const universityUpdateSchema = nonEmptyUpdate({
  title: z.string().trim().min(3),
  slug: z.string().trim().min(3),
  category: z.string().trim().min(1),
  description: z.string().trim().min(1),
  plan_required: z.string().trim().min(1),
  sort_order: z.coerce.number().int(),
  is_published: z.coerce.boolean(),
});

export const reviewCreateSchema = z.object({
  company_name: z.string().trim().min(1),
  quote: z.string().trim().min(1),
  video_url: optionalText,
  broker_endorsement: optionalText,
  is_featured: z.coerce.boolean().default(false),
});

export const reviewUpdateSchema = nonEmptyUpdate({
  company_name: z.string().trim().min(1),
  quote: z.string().trim().min(1),
  video_url: optionalText,
  broker_endorsement: optionalText,
  is_featured: z.coerce.boolean(),
});

export const webinarAgendaCreateSchema = z.object({
  webinar_id: z.string().uuid(),
  time: optionalDateString,
  topic: z.string().trim().min(1),
  speaker_name: z.string().trim().min(1),
  speaker_linkedin: optionalText,
  speaker_image_url: optionalText,
  sort_order: z.coerce.number().int().default(0),
});

export const webinarAgendaUpdateSchema = nonEmptyUpdate({
  webinar_id: z.string().uuid(),
  time: optionalDateString,
  topic: z.string().trim().min(1),
  speaker_name: z.string().trim().min(1),
  speaker_linkedin: optionalText,
  speaker_image_url: optionalText,
  sort_order: z.coerce.number().int(),
});

export const webinarFaqCreateSchema = z.object({
  webinar_id: z.string().uuid(),
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
  sort_order: z.coerce.number().int().default(0),
});

export const webinarFaqUpdateSchema = nonEmptyUpdate({
  webinar_id: z.string().uuid(),
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
  sort_order: z.coerce.number().int(),
});

export const webinarSponsorCreateSchema = z.object({
  webinar_id: z.string().uuid(),
  tier: z.string().trim().min(1).default("SILVER"),
  name: z.string().trim().min(1),
  logo_url: optionalText,
  link_url: optionalText,
});

export const webinarSponsorUpdateSchema = nonEmptyUpdate({
  webinar_id: z.string().uuid(),
  tier: z.string().trim().min(1),
  name: z.string().trim().min(1),
  logo_url: optionalText,
  link_url: optionalText,
});

export const courseLessonCreateSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().trim().min(1),
  sort_order: z.coerce.number().int().default(0),
  duration_minutes: z.coerce.number().int().min(0).optional().nullable(),
  video_url: optionalText,
  pdf_url: optionalText,
  is_free: z.coerce.boolean().default(false),
});

export const courseLessonUpdateSchema = nonEmptyUpdate({
  course_id: z.string().uuid(),
  title: z.string().trim().min(1),
  sort_order: z.coerce.number().int(),
  duration_minutes: z.coerce.number().int().min(0).optional().nullable(),
  video_url: optionalText,
  pdf_url: optionalText,
  is_free: z.coerce.boolean(),
});

export const algoSnapshotCreateSchema = z.object({
  algo_id: z.string().uuid(),
  period_start: optionalDateString,
  period_end: optionalDateString,
  roi_pct: z.coerce.number(),
  drawdown_pct: z.coerce.number(),
});

export const algoSnapshotUpdateSchema = nonEmptyUpdate({
  algo_id: z.string().uuid(),
  period_start: optionalDateString,
  period_end: optionalDateString,
  roi_pct: z.coerce.number(),
  drawdown_pct: z.coerce.number(),
});

export const checkoutAlgoSchema = z.object({
  algoId: z.string().uuid(),
  successPath: z.string().trim().optional(),
  cancelPath: z.string().trim().optional(),
});

export const checkoutWebinarSchema = z.object({
  webinarId: z.string().uuid(),
  successPath: z.string().trim().optional(),
  cancelPath: z.string().trim().optional(),
});

export const stripeWebhookSessionSchema = z.object({
  id: z.string().min(1),
  payment_status: z.string().optional(),
  amount_total: z.number().optional(),
  currency: z.string().optional(),
  metadata: z.record(z.string()).optional(),
  payment_intent: z.union([z.string(), z.null()]).optional(),
});

