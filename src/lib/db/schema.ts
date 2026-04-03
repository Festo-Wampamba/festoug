import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  uuid,
  numeric,
  index,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Enums ──────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["ADMIN", "CUSTOMER"]);
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "COMPLETED",
  "REFUNDED",
  "FAILED",
]);
export const gatewayEnum = pgEnum("payment_gateway", [
  "LEMONSQUEEZY",
  "FLUTTERWAVE",
]);
export const productCategoryEnum = pgEnum("product_category", [
  "SCRIPT",
  "TEMPLATE",
  "PLUGIN",
  "SERVICE",
  "OTHER",
]);
export const accountStatusEnum = pgEnum("account_status", [
  "ACTIVE",
  "SUSPENDED",
  "BANNED",
]);
export const reviewStatusEnum = pgEnum("review_status", [
  "APPROVED",
  "PENDING",
  "REJECTED",
]);
export const maintenancePlanEnum = pgEnum("maintenance_plan", [
  "BASIC",
  "PRO",
  "ENTERPRISE",
]);
export const billingCycleEnum = pgEnum("billing_cycle", ["MONTHLY", "ANNUAL"]);
export const trialStatusEnum = pgEnum("trial_status", [
  "ACTIVE",
  "EXPIRED",
  "CONVERTED",
]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "ACTIVE",
  "CANCELLED",
  "EXPIRED",
]);

// ─── Auth.js Required Tables ─────────────────────────────────────────────────
export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").default("CUSTOMER").notNull(),
  accountStatus: accountStatusEnum("account_status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ─── Products (Digital Storefront) ───────────────────────────────────────────
export const products = pgTable(
  "product",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(), // in USD
    currency: text("currency").default("USD").notNull(),
    category: productCategoryEnum("category").default("OTHER").notNull(),
    variantId: text("variant_id"), // Lemon Squeezy Variant ID
    downloadUrl: text("download_url"),
    thumbnailUrl: text("thumbnail_url"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({ slugIdx: index("product_slug_idx").on(t.slug) })
);

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = pgTable(
  "order",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    gateway: gatewayEnum("gateway").notNull(),
    externalOrderId: text("external_order_id"),
    status: orderStatusEnum("status").default("PENDING").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("USD").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("order_user_idx").on(t.userId),
    statusIdx: index("order_status_idx").on(t.status),
  })
);

// ─── Licenses ─────────────────────────────────────────────────────────────────
export const licenses = pgTable("license", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  licenseKey: text("license_key").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Blog Posts ───────────────────────────────────────────────────────────────
export const blogPosts = pgTable(
  "blog_post",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    content: text("content"), // Rich text (HTML / Markdown)
    excerpt: text("excerpt"),
    coverImage: text("cover_image"),
    category: text("category"),
    isPublished: boolean("is_published").default(false).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    externalLink: text("external_link"), // Keep legacy external links
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: index("blog_slug_idx").on(t.slug),
    publishedIdx: index("blog_published_idx").on(t.isPublished),
  })
);

// ─── Portfolio Projects ───────────────────────────────────────────────────────
export const projects = pgTable(
  "project",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    category: text("category").notNull(),
    image: text("image"),
    description: text("description"),
    liveUrl: text("live_url"),
    repoUrl: text("repo_url"),
    isFeatured: boolean("is_featured").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({ slugIdx: index("project_slug_idx").on(t.slug) })
);

// ─── Testimonials ─────────────────────────────────────────────────────────────
export const testimonials = pgTable("testimonial", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  role: text("role"),
  rating: integer("rating").default(5).notNull(),
  testimonial: text("testimonial").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Services ─────────────────────────────────────────────────────────────────
export const services = pgTable("service", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  icon: text("icon").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// ─── Banned Emails (permanent ban tracking) ──────────────────────────────────
export const bannedEmails = pgTable("banned_email", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  reason: text("reason"),
  bannedAt: timestamp("banned_at").defaultNow().notNull(),
  bannedBy: uuid("banned_by").references(() => users.id, { onDelete: "set null" }),
});

// ─── Password Reset Tokens ──────────────────────────────────────────────────
export const passwordResetTokens = pgTable("password_reset_token", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const reviews = pgTable(
  "review",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    status: reviewStatusEnum("status").default("PENDING").notNull(),
    helpfulCount: integer("helpful_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    productIdx: index("review_product_idx").on(t.productId),
    userIdx: index("review_user_idx").on(t.userId),
    statusIdx: index("review_status_idx").on(t.status),
    userProductUniq: uniqueIndex("review_user_product_uniq").on(t.userId, t.productId),
  })
);

export const reviewHelpfulVotes = pgTable(
  "review_helpful_vote",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    reviewIdx: index("helpful_vote_review_idx").on(t.reviewId),
    userReviewUniq: uniqueIndex("helpful_vote_user_review_uniq").on(t.reviewId, t.userId),
  })
);

// ─── Chat Memory (registered user conversation history) ───────────────────────
export const chatMessages = pgTable(
  "chat_message",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // "user" | "assistant"
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("chat_message_user_idx").on(t.userId),
    userTimeIdx: index("chat_message_user_time_idx").on(t.userId, t.createdAt),
  })
);

// ─── Maintenance Trials ───────────────────────────────────────────────────────
export const maintenanceTrials = pgTable(
  "maintenance_trial",
  {
    id:            uuid("id").primaryKey().defaultRandom(),
    userId:        uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    plan:          maintenancePlanEnum("plan").notNull(),
    billingCycle:  billingCycleEnum("billing_cycle").notNull(),
    websiteUrl:    text("website_url").notNull(),
    status:        trialStatusEnum("status").notNull().default("ACTIVE"),
    trialStartsAt: timestamp("trial_starts_at").defaultNow().notNull(),
    trialEndsAt:   timestamp("trial_ends_at").notNull(),
    notifiedAt:    timestamp("notified_at"),
    createdAt:     timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx:   index("trial_user_idx").on(t.userId),
    statusIdx: index("trial_status_idx").on(t.status),
    endsIdx:   index("trial_ends_idx").on(t.trialEndsAt),
  })
);

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions = pgTable(
  "subscription",
  {
    id:               uuid("id").primaryKey().defaultRandom(),
    userId:           uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    trialId:          uuid("trial_id").references(() => maintenanceTrials.id, { onDelete: "set null" }),
    plan:             maintenancePlanEnum("plan").notNull(),
    billingCycle:     billingCycleEnum("billing_cycle").notNull(),
    status:           subscriptionStatusEnum("status").notNull().default("ACTIVE"),
    lsSubscriptionId: text("ls_subscription_id").notNull().unique(),
    lsVariantId:      text("ls_variant_id").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    cancelledAt:      timestamp("cancelled_at"),
    createdAt:        timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx:   index("sub_user_idx").on(t.userId),
    statusIdx: index("sub_status_idx").on(t.status),
  })
);

// ─── Project Inquiries ────────────────────────────────────────────────────────
export const projectInquiries = pgTable(
  "project_inquiry",
  {
    id:        uuid("id").primaryKey().defaultRandom(),
    name:      text("name").notNull(),
    email:     text("email").notNull(),
    company:   text("company"),
    plan:      text("plan").notNull(),
    timeline:  text("timeline").notNull(),
    vision:    text("vision").notNull(),
    status:    text("status").notNull().default("NEW"),  // NEW | REVIEWED | CLOSED
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    statusIdx: index("inquiry_status_idx").on(t.status),
    emailIdx:  index("inquiry_email_idx").on(t.email),
  })
);

// ─── Relations ────────────────────────────────────────────────────────────────
import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({
  orders:             many(orders),
  licenses:           many(licenses),
  accounts:           many(accounts),
  sessions:           many(sessions),
  blogPosts:          many(blogPosts),
  reviews:            many(reviews),
  chatMessages:       many(chatMessages),
  maintenanceTrials:  many(maintenanceTrials),
  subscriptions:      many(subscriptions),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, { fields: [chatMessages.userId], references: [users.id] }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orders: many(orders),
  licenses: many(licenses),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
  licenses: many(licenses),
  reviews: many(reviews),
}));

export const licensesRelations = relations(licenses, ({ one }) => ({
  user: one(users, {
    fields: [licenses.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [licenses.productId],
    references: [products.id],
  }),
  order: one(orders, {
    fields: [licenses.orderId],
    references: [orders.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  order: one(orders, { fields: [reviews.orderId], references: [orders.id] }),
  helpfulVotes: many(reviewHelpfulVotes),
}));

export const reviewHelpfulVotesRelations = relations(reviewHelpfulVotes, ({ one }) => ({
  review: one(reviews, { fields: [reviewHelpfulVotes.reviewId], references: [reviews.id] }),
  user: one(users, { fields: [reviewHelpfulVotes.userId], references: [users.id] }),
}));

export const maintenanceTrialsRelations = relations(maintenanceTrials, ({ one }) => ({
  user: one(users, { fields: [maintenanceTrials.userId], references: [users.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  trial: one(maintenanceTrials, { fields: [subscriptions.trialId], references: [maintenanceTrials.id] }),
}));
