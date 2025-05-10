"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../shared/schema");
class DatabaseStorage {
    // User operations
    async getUser(id) {
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
        return user;
    }
    async upsertUser(userData) {
        const [user] = await db_1.db
            .insert(schema_1.users)
            .values(userData)
            .onConflictDoUpdate({
            target: schema_1.users.id,
            set: {
                ...userData,
                updatedAt: new Date(),
            },
        })
            .returning();
        return user;
    }
    // User preferences
    async getUserPreferences(userId) {
        const [prefs] = await db_1.db
            .select()
            .from(schema_1.userPreferences)
            .where((0, drizzle_orm_1.eq)(schema_1.userPreferences.userId, userId));
        return prefs;
    }
    async setUserPreferences(prefs) {
        // Check if preferences already exist
        const existing = await this.getUserPreferences(prefs.userId);
        if (existing) {
            // Update existing
            const [updated] = await db_1.db
                .update(schema_1.userPreferences)
                .set({
                ...prefs,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.userPreferences.id, existing.id))
                .returning();
            return updated;
        }
        else {
            // Insert new
            const [newPrefs] = await db_1.db
                .insert(schema_1.userPreferences)
                .values(prefs)
                .returning();
            return newPrefs;
        }
    }
    // Data sources
    async getUserDataSources(userId) {
        return db_1.db
            .select()
            .from(schema_1.dataSources)
            .where((0, drizzle_orm_1.eq)(schema_1.dataSources.userId, userId))
            .orderBy(schema_1.dataSources.createdAt);
    }
    async addDataSource(source) {
        const [newSource] = await db_1.db
            .insert(schema_1.dataSources)
            .values(source)
            .returning();
        return newSource;
    }
    async updateDataSource(id, source) {
        const [updated] = await db_1.db
            .update(schema_1.dataSources)
            .set({
            ...source,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.dataSources.id, id))
            .returning();
        return updated;
    }
    async removeDataSource(id) {
        await db_1.db
            .delete(schema_1.dataSources)
            .where((0, drizzle_orm_1.eq)(schema_1.dataSources.id, id));
    }
    // OAuth tokens
    async getOAuthToken(dataSourceId) {
        const [token] = await db_1.db
            .select()
            .from(schema_1.oauthTokens)
            .where((0, drizzle_orm_1.eq)(schema_1.oauthTokens.dataSourceId, dataSourceId));
        return token;
    }
    async saveOAuthToken(token) {
        // Check if token already exists
        const existing = await this.getOAuthToken(token.dataSourceId);
        if (existing) {
            // Update existing
            const [updated] = await db_1.db
                .update(schema_1.oauthTokens)
                .set({
                ...token,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.oauthTokens.id, existing.id))
                .returning();
            return updated;
        }
        else {
            // Insert new
            const [newToken] = await db_1.db
                .insert(schema_1.oauthTokens)
                .values(token)
                .returning();
            return newToken;
        }
    }
    async updateOAuthToken(id, token) {
        const [updated] = await db_1.db
            .update(schema_1.oauthTokens)
            .set({
            ...token,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.oauthTokens.id, id))
            .returning();
        return updated;
    }
    // Insights
    async getUserInsights(userId) {
        return db_1.db
            .select()
            .from(schema_1.insights)
            .where((0, drizzle_orm_1.eq)(schema_1.insights.userId, userId))
            .orderBy(schema_1.insights.createdAt);
    }
    async getInsightById(id) {
        const [insight] = await db_1.db
            .select()
            .from(schema_1.insights)
            .where((0, drizzle_orm_1.eq)(schema_1.insights.id, id));
        return insight;
    }
    async saveInsight(insight) {
        const [newInsight] = await db_1.db
            .insert(schema_1.insights)
            .values(insight)
            .returning();
        return newInsight;
    }
    async updateInsight(id, insight) {
        const [updated] = await db_1.db
            .update(schema_1.insights)
            .set({
            ...insight,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.insights.id, id))
            .returning();
        return updated;
    }
    async removeInsight(id) {
        await db_1.db
            .delete(schema_1.insights)
            .where((0, drizzle_orm_1.eq)(schema_1.insights.id, id));
    }
}
exports.DatabaseStorage = DatabaseStorage;
// Create and export the storage instance
exports.storage = new DatabaseStorage();
