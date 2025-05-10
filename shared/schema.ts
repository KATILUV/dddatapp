import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  boolean,
  integer,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User table for storing Replit Auth user data
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  theme: varchar("theme").default("dark"),
  communicationStyle: varchar("communication_style"), // direct, supportive, analytical
  notificationsEnabled: boolean("notifications_enabled").default(true),
  dataProcessingEnabled: boolean("data_processing_enabled").default(true),
  enhancedProfilingEnabled: boolean("enhanced_profiling_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Data sources table
export const dataSources = pgTable("data_sources", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  sourceType: varchar("source_type").notNull(), // google, twitter, spotify, etc.
  status: varchar("status").default("disconnected"), // connected, disconnected, error
  lastSynced: timestamp("last_synced"),
  dataSize: integer("data_size"), // in bytes
  config: jsonb("config"), // source-specific configuration
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OAuth tokens table
export const oauthTokens = pgTable("oauth_tokens", {
  id: serial("id").primaryKey(),
  dataSourceId: integer("data_source_id").notNull().unique().references(() => dataSources.id, { onDelete: "cascade" }),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  tokenType: varchar("token_type").default("Bearer"),
  scope: varchar("scope"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insights table
export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // behavioral, creative, emotional
  title: varchar("title").notNull(),
  summary: text("summary").notNull(),
  details: jsonb("details"),
  confidence: integer("confidence"), // 0-100
  sources: jsonb("sources"), // Array of source IDs that generated this insight
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  preferences: many(userPreferences),
  dataSources: many(dataSources),
  insights: many(insights),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const dataSourcesRelations = relations(dataSources, ({ one }) => ({
  user: one(users, {
    fields: [dataSources.userId],
    references: [users.id],
  }),
}));

export const oauthTokensRelations = relations(oauthTokens, ({ one }) => ({
  dataSource: one(dataSources, {
    fields: [oauthTokens.dataSourceId],
    references: [dataSources.id],
  }),
}));

export const insightsRelations = relations(insights, ({ one }) => ({
  user: one(users, {
    fields: [insights.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

export type DataSource = typeof dataSources.$inferSelect;
export type InsertDataSource = typeof dataSources.$inferInsert;

export type OAuthToken = typeof oauthTokens.$inferSelect;
export type InsertOAuthToken = typeof oauthTokens.$inferInsert;

export type Insight = typeof insights.$inferSelect;
export type InsertInsight = typeof insights.$inferInsert;