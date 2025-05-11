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
import { eq, desc } from "drizzle-orm";

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
  getDataSourceById(id: number): Promise<DataSource | undefined>;
  getDataSourcesByType(userId: string, sourceType: string): Promise<DataSource[]>;
  addDataSource(source: InsertDataSource): Promise<DataSource>;
  updateDataSource(id: number, source: Partial<InsertDataSource>): Promise<DataSource>;
  removeDataSource(id: number): Promise<void>;
  refreshDataSource(id: number): Promise<DataSource>;
  scheduleDataSourceSync(id: number, frequency: string): Promise<DataSource>;
  
  // OAuth tokens
  getOAuthToken(dataSourceId: number): Promise<OAuthToken | undefined>;
  saveOAuthToken(token: InsertOAuthToken): Promise<OAuthToken>;
  updateOAuthToken(id: number, token: Partial<InsertOAuthToken>): Promise<OAuthToken>;
  
  // Insights
  getUserInsights(userId: string): Promise<Insight[]>;
  getUserInsightsByCategory(userId: string, category: string): Promise<Insight[]>;
  getUserInsightsByType(userId: string, type: string): Promise<Insight[]>;
  getStarredInsights(userId: string): Promise<Insight[]>;
  getInsightById(id: number): Promise<Insight | undefined>;
  saveInsight(insight: InsertInsight): Promise<Insight>;
  updateInsight(id: number, insight: Partial<InsertInsight>): Promise<Insight>;
  starInsight(id: number, starred: boolean): Promise<Insight>;
  archiveInsight(id: number, archived: boolean): Promise<Insight>;
  trackInsightExport(id: number, destination: string): Promise<Insight>;
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

  async getDataSourceById(id: number): Promise<DataSource | undefined> {
    const [source] = await db
      .select()
      .from(dataSources)
      .where(eq(dataSources.id, id));
    return source;
  }

  async getDataSourcesByType(userId: string, sourceType: string): Promise<DataSource[]> {
    return await db
      .select()
      .from(dataSources)
      .where(eq(dataSources.userId, userId))
      .where(eq(dataSources.sourceType, sourceType));
  }

  async addDataSource(source: InsertDataSource): Promise<DataSource> {
    // Set next sync time based on frequency if not provided
    if (!source.nextSyncDue && source.syncFrequency) {
      const now = new Date();
      switch (source.syncFrequency) {
        case 'hourly':
          now.setHours(now.getHours() + 1);
          break;
        case 'daily':
          now.setDate(now.getDate() + 1);
          break;
        case 'weekly':
          now.setDate(now.getDate() + 7);
          break;
        case 'monthly':
          now.setMonth(now.getMonth() + 1);
          break;
      }
      source.nextSyncDue = now;
    }

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

  async refreshDataSource(id: number): Promise<DataSource> {
    // This would trigger a data refresh for the source
    // In practice, it would call the appropriate API client based on sourceType
    const now = new Date();
    const [source] = await db
      .select()
      .from(dataSources)
      .where(eq(dataSources.id, id));
    
    if (!source) {
      throw new Error(`Data source with id ${id} not found`);
    }

    // Update the lastSynced timestamp and calculate next sync time
    let nextSyncDue: Date;
    switch (source.syncFrequency) {
      case 'hourly':
        nextSyncDue = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case 'daily':
        nextSyncDue = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        nextSyncDue = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        nextSyncDue = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        nextSyncDue = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to daily
    }

    const [updatedSource] = await db
      .update(dataSources)
      .set({
        lastSynced: now,
        nextSyncDue,
        dataFreshness: 100, // Reset freshness to 100% after sync
        status: 'connected',
        errorMessage: null,
        updatedAt: now,
      })
      .where(eq(dataSources.id, id))
      .returning();
    
    return updatedSource;
  }

  async scheduleDataSourceSync(id: number, frequency: string): Promise<DataSource> {
    const now = new Date();
    let nextSyncDue: Date;
    
    // Calculate next sync time based on frequency
    switch (frequency) {
      case 'hourly':
        nextSyncDue = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case 'daily':
        nextSyncDue = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        nextSyncDue = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        nextSyncDue = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        nextSyncDue = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to daily
    }

    const [updatedSource] = await db
      .update(dataSources)
      .set({
        syncFrequency: frequency,
        nextSyncDue,
        syncEnabled: true,
        updatedAt: now,
      })
      .where(eq(dataSources.id, id))
      .returning();
    
    return updatedSource;
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
      .where(eq(insights.userId, userId))
      .where(eq(insights.isArchived, false))
      .orderBy(desc(insights.createdAt));
  }

  async getUserInsightsByCategory(userId: string, category: string): Promise<Insight[]> {
    return await db
      .select()
      .from(insights)
      .where(eq(insights.userId, userId))
      .where(eq(insights.category, category))
      .where(eq(insights.isArchived, false))
      .orderBy(desc(insights.createdAt));
  }

  async getUserInsightsByType(userId: string, type: string): Promise<Insight[]> {
    return await db
      .select()
      .from(insights)
      .where(eq(insights.userId, userId))
      .where(eq(insights.type, type))
      .where(eq(insights.isArchived, false))
      .orderBy(desc(insights.createdAt));
  }

  async getStarredInsights(userId: string): Promise<Insight[]> {
    return await db
      .select()
      .from(insights)
      .where(eq(insights.userId, userId))
      .where(eq(insights.isStarred, true))
      .orderBy(desc(insights.createdAt));
  }

  async getInsightById(id: number): Promise<Insight | undefined> {
    const [insight] = await db
      .select()
      .from(insights)
      .where(eq(insights.id, id));
    return insight;
  }

  async saveInsight(insight: InsertInsight): Promise<Insight> {
    // Set default category if not provided based on type
    if (!insight.category && insight.type) {
      switch (insight.type) {
        case 'behavioral':
          insight.category = 'productivity';
          break;
        case 'emotional':
          insight.category = 'wellbeing';
          break;
        case 'creative':
          insight.category = 'creativity';
          break;
        case 'correlation':
          insight.category = 'patterns';
          break;
        case 'pattern':
          insight.category = 'patterns';
          break;
        case 'prediction':
          insight.category = 'future';
          break;
        default:
          insight.category = 'general';
      }
    }
    
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

  async starInsight(id: number, starred: boolean): Promise<Insight> {
    const [updatedInsight] = await db
      .update(insights)
      .set({
        isStarred: starred,
        updatedAt: new Date(),
      })
      .where(eq(insights.id, id))
      .returning();
    return updatedInsight;
  }

  async archiveInsight(id: number, archived: boolean): Promise<Insight> {
    const [updatedInsight] = await db
      .update(insights)
      .set({
        isArchived: archived,
        updatedAt: new Date(),
      })
      .where(eq(insights.id, id))
      .returning();
    return updatedInsight;
  }

  async trackInsightExport(id: number, destination: string): Promise<Insight> {
    // Get the current insight first
    const [currentInsight] = await db
      .select()
      .from(insights)
      .where(eq(insights.id, id));
    
    if (!currentInsight) {
      throw new Error(`Insight with ID ${id} not found`);
    }
    
    // Create or update export history
    let exportHistory = [];
    if (currentInsight.exportHistory) {
      if (Array.isArray(currentInsight.exportHistory)) {
        exportHistory = [...currentInsight.exportHistory];
      } else if (typeof currentInsight.exportHistory === 'string') {
        try {
          exportHistory = JSON.parse(currentInsight.exportHistory);
        } catch (e) {
          exportHistory = [];
        }
      }
    }
    
    // Add new export record
    exportHistory.push({
      destination,
      timestamp: new Date().toISOString()
    });
    
    // Update the insight with the new export history
    const [updatedInsight] = await db
      .update(insights)
      .set({
        exportHistory: exportHistory,
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