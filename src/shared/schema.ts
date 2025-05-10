import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  integer,
  boolean,
  serial,
  index,
  uniqueIndex
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

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User preferences
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  privacyLevel: varchar("privacy_level").notNull().default("maximum"), // maximum, balanced, enhanced
  analysisFrequency: varchar("analysis_frequency").notNull().default("weekly"), // daily, weekly, monthly
  notificationLevel: varchar("notification_level").notNull().default("moderate"), // minimal, moderate, frequent  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Data sources table
export const dataSources = pgTable("data_sources", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sourceType: varchar("source_type").notNull(), // google, twitter, instagram, spotify, etc.
  sourceId: varchar("source_id").notNull(), // unique identifier for this source
  displayName: varchar("display_name").notNull(), // user-friendly name
  connected: boolean("connected").notNull().default(false), // whether currently connected
  lastSynced: timestamp("last_synced"), // when data was last imported
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userSourceIdx: index("user_source_idx").on(table.userId, table.sourceType),
    uniqueSource: uniqueIndex("unique_source_idx").on(table.userId, table.sourceId)
  }
});

// OAuth tokens table
export const oauthTokens = pgTable("oauth_tokens", {
  id: serial("id").primaryKey(),
  dataSourceId: integer("data_source_id").notNull().references(() => dataSources.id, { onDelete: "cascade" }),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenType: varchar("token_type").notNull().default("Bearer"),
  scope: text("scope"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insights table
export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // wellness, preferences, communication, etc.
  insightData: jsonb("insight_data"), // JSON data for visualization
  sourceIds: integer("source_ids").array(), // Array of data source IDs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    userInsightsIdx: index("user_insights_idx").on(table.userId),
    categoryIdx: index("category_idx").on(table.category),
  }
});

// Define relations
export const userRelations = relations(users, ({ many }) => ({
  preferences: many(userPreferences),
  dataSources: many(dataSources),
  insights: many(insights),
}));

export const dataSourceRelations = relations(dataSources, ({ one, many }) => ({
  user: one(users, {
    fields: [dataSources.userId],
    references: [users.id],
  }),
  tokens: many(oauthTokens),
}));

export const oauthTokenRelations = relations(oauthTokens, ({ one }) => ({
  dataSource: one(dataSources, {
    fields: [oauthTokens.dataSourceId],
    references: [dataSources.id],
  }),
}));

export const insightRelations = relations(insights, ({ one }) => ({
  user: one(users, {
    fields: [insights.userId],
    references: [users.id],
  }),
}));

// Types
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