"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insightsRelations = exports.oauthTokensRelations = exports.dataSourcesRelations = exports.userPreferencesRelations = exports.usersRelations = exports.insights = exports.oauthTokens = exports.dataSources = exports.userPreferences = exports.users = exports.sessions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// Session storage table for authentication
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.varchar)("sid").primaryKey(),
    sess: (0, pg_core_1.json)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
}, (table) => [
    (0, pg_core_1.index)("IDX_session_expire").on(table.expire),
]);
// Users table
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
    notificationsEnabled: (0, pg_core_1.boolean)("notifications_enabled").default(true),
    dataRetentionPeriod: (0, pg_core_1.integer)("data_retention_period").default(90), // days
    privacySettings: (0, pg_core_1.json)("privacy_settings"),
    servicePreferences: (0, pg_core_1.json)("service_preferences"), // Which services to analyze, what data to show
    insightFrequency: (0, pg_core_1.varchar)("insight_frequency").default("daily"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Data sources table
exports.dataSources = (0, pg_core_1.pgTable)("data_sources", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    sourceType: (0, pg_core_1.varchar)("source_type").notNull(), // google, twitter, spotify, etc.
    sourceId: (0, pg_core_1.varchar)("source_id").notNull(), // ID from the source service
    displayName: (0, pg_core_1.varchar)("display_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    connected: (0, pg_core_1.boolean)("connected").default(false),
    lastSynced: (0, pg_core_1.timestamp)("last_synced"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, (table) => {
    return {
        userIdSourceTypeIdx: (0, pg_core_1.index)("user_id_source_type_idx").on(table.userId, table.sourceType),
    };
});
// OAuth tokens table
exports.oauthTokens = (0, pg_core_1.pgTable)("oauth_tokens", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    dataSourceId: (0, pg_core_1.integer)("data_source_id").notNull().references(() => exports.dataSources.id, { onDelete: "cascade" }),
    accessToken: (0, pg_core_1.text)("access_token").notNull(),
    refreshToken: (0, pg_core_1.text)("refresh_token"),
    tokenType: (0, pg_core_1.varchar)("token_type").default("Bearer"),
    scope: (0, pg_core_1.text)("scope"),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// User insights table
exports.insights = (0, pg_core_1.pgTable)("insights", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    type: (0, pg_core_1.varchar)("type").notNull(), // behavioral, creative, emotional, etc.
    data: (0, pg_core_1.json)("data").notNull(), // Specific data for the insight type
    sources: (0, pg_core_1.json)("sources"), // Which data sources contributed to this insight
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, (table) => {
    return {
        userIdTypeIdx: (0, pg_core_1.index)("user_id_type_idx").on(table.userId, table.type),
    };
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
exports.dataSourcesRelations = (0, drizzle_orm_1.relations)(exports.dataSources, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.dataSources.userId],
        references: [exports.users.id],
    }),
    oauthTokens: many(exports.oauthTokens),
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
