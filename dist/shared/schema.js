"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insightsRelations = exports.oauthTokensRelations = exports.dataSourcesRelations = exports.userPreferencesRelations = exports.usersRelations = exports.insights = exports.oauthTokens = exports.dataSources = exports.userPreferences = exports.users = exports.sessions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// Session storage table for Replit Auth
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.varchar)("sid").primaryKey(),
    sess: (0, pg_core_1.jsonb)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
}, (table) => [(0, pg_core_1.index)("IDX_session_expire").on(table.expire)]);
// User table for storing Replit Auth user data
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.varchar)("id").primaryKey().notNull(),
    email: (0, pg_core_1.varchar)("email").unique(),
    firstName: (0, pg_core_1.varchar)("first_name"),
    lastName: (0, pg_core_1.varchar)("last_name"),
    profileImageUrl: (0, pg_core_1.varchar)("profile_image_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// User preferences table
exports.userPreferences = (0, pg_core_1.pgTable)("user_preferences", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    theme: (0, pg_core_1.varchar)("theme").default("dark"),
    communicationStyle: (0, pg_core_1.varchar)("communication_style"), // direct, supportive, analytical
    notificationsEnabled: (0, pg_core_1.boolean)("notifications_enabled").default(true),
    dataProcessingEnabled: (0, pg_core_1.boolean)("data_processing_enabled").default(true),
    enhancedProfilingEnabled: (0, pg_core_1.boolean)("enhanced_profiling_enabled").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Data sources table
exports.dataSources = (0, pg_core_1.pgTable)("data_sources", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    name: (0, pg_core_1.varchar)("name").notNull(),
    sourceType: (0, pg_core_1.varchar)("source_type").notNull(), // google, twitter, spotify, etc.
    status: (0, pg_core_1.varchar)("status").default("disconnected"), // connected, disconnected, error
    lastSynced: (0, pg_core_1.timestamp)("last_synced"),
    dataSize: (0, pg_core_1.integer)("data_size"), // in bytes
    config: (0, pg_core_1.jsonb)("config"), // source-specific configuration
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// OAuth tokens table
exports.oauthTokens = (0, pg_core_1.pgTable)("oauth_tokens", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    dataSourceId: (0, pg_core_1.integer)("data_source_id").notNull().unique().references(() => exports.dataSources.id, { onDelete: "cascade" }),
    accessToken: (0, pg_core_1.text)("access_token").notNull(),
    refreshToken: (0, pg_core_1.text)("refresh_token"),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
    tokenType: (0, pg_core_1.varchar)("token_type").default("Bearer"),
    scope: (0, pg_core_1.varchar)("scope"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Insights table
exports.insights = (0, pg_core_1.pgTable)("insights", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    type: (0, pg_core_1.varchar)("type").notNull(), // behavioral, creative, emotional
    title: (0, pg_core_1.varchar)("title").notNull(),
    summary: (0, pg_core_1.text)("summary").notNull(),
    details: (0, pg_core_1.jsonb)("details"),
    confidence: (0, pg_core_1.integer)("confidence"), // 0-100
    sources: (0, pg_core_1.jsonb)("sources"), // Array of source IDs that generated this insight
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Define relations
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    preferences: many(exports.userPreferences),
    dataSources: many(exports.dataSources),
    insights: many(exports.insights),
}));
exports.userPreferencesRelations = (0, drizzle_orm_1.relations)(exports.userPreferences, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.userPreferences.userId],
        references: [exports.users.id],
    }),
}));
exports.dataSourcesRelations = (0, drizzle_orm_1.relations)(exports.dataSources, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.dataSources.userId],
        references: [exports.users.id],
    }),
}));
exports.oauthTokensRelations = (0, drizzle_orm_1.relations)(exports.oauthTokens, ({ one }) => ({
    dataSource: one(exports.dataSources, {
        fields: [exports.oauthTokens.dataSourceId],
        references: [exports.dataSources.id],
    }),
}));
exports.insightsRelations = (0, drizzle_orm_1.relations)(exports.insights, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.insights.userId],
        references: [exports.users.id],
    }),
}));
