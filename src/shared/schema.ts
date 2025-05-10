import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
  json,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [
    index("IDX_session_expire").on(table.expire),
  ]
);

// Users table
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
  notificationsEnabled: boolean("notifications_enabled").default(true),
  dataRetentionPeriod: integer("data_retention_period").default(90), // days
  privacySettings: json("privacy_settings"),
  servicePreferences: json("service_preferences"), // Which services to analyze, what data to show
  insightFrequency: varchar("insight_frequency").default("daily"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Data sources table
export const dataSources = pgTable("data_sources", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sourceType: varchar("source_type").notNull(), // google, twitter, spotify, etc.
  sourceId: varchar("source_id").notNull(), // ID from the source service
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  connected: boolean("connected").default(false),
  lastSynced: timestamp("last_synced"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userIdSourceTypeIdx: index("user_id_source_type_idx").on(table.userId, table.sourceType),
  };
});

// OAuth tokens table
export const oauthTokens = pgTable("oauth_tokens", {
  id: serial("id").primaryKey(),
  dataSourceId: integer("data_source_id").notNull().references(() => dataSources.id, { onDelete: "cascade" }),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenType: varchar("token_type").default("Bearer"),
  scope: text("scope"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User insights table
export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // behavioral, creative, emotional, etc.
  data: json("data").notNull(), // Specific data for the insight type
  sources: json("sources"), // Which data sources contributed to this insight
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userIdTypeIdx: index("user_id_type_idx").on(table.userId, table.type),
  };
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

export const dataSourcesRelations = relations(dataSources, ({ one, many }) => ({
  user: one(users, {
    fields: [dataSources.userId],
    references: [users.id],
  }),
  oauthTokens: many(oauthTokens),
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

// Type definitions
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