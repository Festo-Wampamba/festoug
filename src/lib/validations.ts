import { z } from "zod/v4";

// ─── Product Schemas ─────────────────────────────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(5000).nullable().optional(),
  price: z
    .string()
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Price must be a non-negative number"),
  category: z.enum(["SCRIPT", "TEMPLATE", "PLUGIN", "SERVICE", "OTHER"]),
  variantId: z.string().max(100).nullable().optional(),
  downloadUrl: z.string().url("Must be a valid URL").max(500).nullable().optional(),
  thumbnailUrl: z.string().max(500).nullable().optional(),
  screenshots: z.array(z.string().url()).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;

// ─── Blog Post Schemas ───────────────────────────────────────────────────────

export const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(300)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  excerpt: z.string().max(1000).nullable().optional(),
  content: z.string().max(100_000).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  coverImage: z.string().max(2000).nullable().optional(),
  isPublished: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;

// ─── Review Schemas ─────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  productId: z.string().uuid(),
  orderId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must be under 200 characters"),
  body: z.string().min(10, "Review must be at least 10 characters").max(2000, "Review must be under 2000 characters"),
});

export const reviewUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must be under 200 characters"),
  body: z.string().min(10, "Review must be at least 10 characters").max(2000, "Review must be under 2000 characters"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
export type ReviewUpdateInput = z.infer<typeof reviewUpdateSchema>;

// ─── Project Schemas ────────────────────────────────────────────────────────

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(5000).nullable().optional(),
  image: z.string().max(500).nullable().optional(),
  liveUrl: z.string().max(500).nullable().optional(),
  repoUrl: z.string().max(500).nullable().optional(),
  category: z.string().min(1, "Category is required").max(100),
  isFeatured: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export type ProjectInput = z.infer<typeof projectSchema>;

// ─── Testimonial Schemas ────────────────────────────────────────────────────

export const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  avatar: z.string().max(500).nullable().optional(),
  role: z.string().max(200).nullable().optional(),
  rating: z.number().int().min(1).max(5),
  testimonial: z.string().min(10, "Testimonial must be at least 10 characters").max(2000),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;

// ─── Auth Schemas ────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long").trim(),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "Must contain at least one letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

// ─── Profile Schemas ─────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long").trim(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "Must contain at least one letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ALLOWED_AVATAR_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
export const avatarUploadSchema = z.object({
  mimeType: z.enum(ALLOWED_AVATAR_MIME, { error: "Only JPEG, PNG, GIF, or WebP allowed" }),
  sizeBytes: z.number().max(1_048_576, "File must be under 1MB"),
});
