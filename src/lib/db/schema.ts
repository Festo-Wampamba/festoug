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

// ─── Auth.js Required Tables ─────────────────────────────────────────────────
export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").default("CUSTOMER").notNull(),
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
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ slugIdx: index("project_slug_idx").on(t.slug) })
);

// ─── Testimonials ─────────────────────────────────────────────────────────────
export const testimonials = pgTable("testimonial", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  avatar: text("avatar"),
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

// ─── Relations ────────────────────────────────────────────────────────────────
import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  licenses: many(licenses),
  accounts: many(accounts),
  sessions: many(sessions),
  blogPosts: many(blogPosts),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orders: many(orders),
  licenses: many(licenses),
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
