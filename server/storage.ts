import {
  users,
  userPreferences,
  dataSources,
  oauthTokens,
  insights,
  type User,
  type UpsertUser,
  type UserPreference,
  type InsertUserPreference,
  type DataSource,
  type InsertDataSource,
  type OAuthToken,
  type InsertOAuthToken,
  type Insight,
  type InsertInsight
} from "../shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User preferences
  getUserPreferences(userId: string): Promise<UserPreference | undefined>;
  setUserPreferences(prefs: InsertUserPreference): Promise<UserPreference>;
  
  // Data sources
  getUserDataSources(userId: string): Promise<DataSource[]>;
  addDataSource(source: InsertDataSource): Promise<DataSource>;
  updateDataSource(id: number, source: Partial<InsertDataSource>): Promise<DataSource>;
  removeDataSource(id: number): Promise<void>;
  
  // OAuth tokens
  getOAuthToken(dataSourceId: number): Promise<OAuthToken | undefined>;
  saveOAuthToken(token: InsertOAuthToken): Promise<OAuthToken>;
  updateOAuthToken(id: number, token: Partial<InsertOAuthToken>): Promise<OAuthToken>;
  
  // Insights
  getUserInsights(userId: string): Promise<Insight[]>;
  getInsightById(id: number): Promise<Insight | undefined>;
  saveInsight(insight: InsertInsight): Promise<Insight>;
  updateInsight(id: number, insight: Partial<InsertInsight>): Promise<Insight>;
  removeInsight(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User preferences
  async getUserPreferences(userId: string): Promise<UserPreference | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async setUserPreferences(prefs: InsertUserPreference): Promise<UserPreference> {
    const [existingPrefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, prefs.userId));

    if (existingPrefs) {
      const [updatedPrefs] = await db
        .update(userPreferences)
        .set({
          ...prefs,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.id, existingPrefs.id))
        .returning();
      return updatedPrefs;
    } else {
      const [newPrefs] = await db
        .insert(userPreferences)
        .values(prefs)
        .returning();
      return newPrefs;
    }
  }

  // Data sources
  async getUserDataSources(userId: string): Promise<DataSource[]> {
    return await db
      .select()
      .from(dataSources)
      .where(eq(dataSources.userId, userId));
  }

  async addDataSource(source: InsertDataSource): Promise<DataSource> {
    const [newSource] = await db
      .insert(dataSources)
      .values(source)
      .returning();
    return newSource;
  }

  async updateDataSource(id: number, source: Partial<InsertDataSource>): Promise<DataSource> {
    const [updatedSource] = await db
      .update(dataSources)
      .set({
        ...source,
        updatedAt: new Date(),
      })
      .where(eq(dataSources.id, id))
      .returning();
    return updatedSource;
  }

  async removeDataSource(id: number): Promise<void> {
    await db
      .delete(dataSources)
      .where(eq(dataSources.id, id));
  }

  // OAuth tokens
  async getOAuthToken(dataSourceId: number): Promise<OAuthToken | undefined> {
    const [token] = await db
      .select()
      .from(oauthTokens)
      .where(eq(oauthTokens.dataSourceId, dataSourceId));
    return token;
  }

  async saveOAuthToken(token: InsertOAuthToken): Promise<OAuthToken> {
    const [newToken] = await db
      .insert(oauthTokens)
      .values(token)
      .returning();
    return newToken;
  }

  async updateOAuthToken(id: number, token: Partial<InsertOAuthToken>): Promise<OAuthToken> {
    const [updatedToken] = await db
      .update(oauthTokens)
      .set({
        ...token,
        updatedAt: new Date(),
      })
      .where(eq(oauthTokens.id, id))
      .returning();
    return updatedToken;
  }

  // Insights
  async getUserInsights(userId: string): Promise<Insight[]> {
    return await db
      .select()
      .from(insights)
      .where(eq(insights.userId, userId));
  }

  async getInsightById(id: number): Promise<Insight | undefined> {
    const [insight] = await db
      .select()
      .from(insights)
      .where(eq(insights.id, id));
    return insight;
  }

  async saveInsight(insight: InsertInsight): Promise<Insight> {
    const [newInsight] = await db
      .insert(insights)
      .values(insight)
      .returning();
    return newInsight;
  }

  async updateInsight(id: number, insight: Partial<InsertInsight>): Promise<Insight> {
    const [updatedInsight] = await db
      .update(insights)
      .set({
        ...insight,
        updatedAt: new Date(),
      })
      .where(eq(insights.id, id))
      .returning();
    return updatedInsight;
  }

  async removeInsight(id: number): Promise<void> {
    await db
      .delete(insights)
      .where(eq(insights.id, id));
  }
}

export const storage = new DatabaseStorage();