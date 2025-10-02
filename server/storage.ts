import { type DesignSystem, type InsertDesignSystem, designSystems, type PromptHistory, type InsertPromptHistory, promptHistory } from "@shared/schema";
import { db } from "@db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAllDesignSystems(): Promise<DesignSystem[]>;
  getDesignSystem(id: string): Promise<DesignSystem | undefined>;
  getDesignSystemByName(name: string): Promise<DesignSystem | undefined>;
  createDesignSystem(designSystem: InsertDesignSystem): Promise<DesignSystem>;
  updateDesignSystem(id: string, designSystem: Partial<InsertDesignSystem>): Promise<DesignSystem | undefined>;
  deleteDesignSystem(id: string): Promise<boolean>;
  
  getRecentPrompts(limit: number): Promise<PromptHistory[]>;
  savePrompt(prompt: InsertPromptHistory): Promise<PromptHistory>;
}

export class MemStorage implements IStorage {
  async getAllDesignSystems(): Promise<DesignSystem[]> {
    return db.select().from(designSystems);
  }

  async getDesignSystem(id: string): Promise<DesignSystem | undefined> {
    const [designSystem] = await db.select().from(designSystems).where(eq(designSystems.id, id));
    return designSystem;
  }

  async getDesignSystemByName(name: string): Promise<DesignSystem | undefined> {
    const [designSystem] = await db.select().from(designSystems).where(eq(designSystems.name, name));
    return designSystem;
  }

  async createDesignSystem(insertDesignSystem: InsertDesignSystem): Promise<DesignSystem> {
    const [designSystem] = await db.insert(designSystems).values(insertDesignSystem).returning();
    return designSystem;
  }

  async updateDesignSystem(id: string, updates: Partial<InsertDesignSystem>): Promise<DesignSystem | undefined> {
    const [designSystem] = await db
      .update(designSystems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(designSystems.id, id))
      .returning();
    return designSystem;
  }

  async deleteDesignSystem(id: string): Promise<boolean> {
    const result = await db.delete(designSystems).where(eq(designSystems.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getRecentPrompts(limit: number = 20): Promise<PromptHistory[]> {
    return db.select().from(promptHistory).orderBy(desc(promptHistory.createdAt)).limit(limit);
  }

  async savePrompt(insertPrompt: InsertPromptHistory): Promise<PromptHistory> {
    const [prompt] = await db.insert(promptHistory).values(insertPrompt).returning();
    return prompt;
  }
}

export const storage = new MemStorage();
