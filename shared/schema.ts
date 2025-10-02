import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  prompt: text("prompt").notNull(),
  devices: jsonb("devices").notNull().$type<string[]>(),
  designSystemComponents: jsonb("design_system_components").$type<{ name: string; url: string }[]>(),
  templateUrl: text("template_url"),
  templateStyles: jsonb("template_styles").$type<{
    colors?: string[];
    fonts?: string[];
    spacing?: string[];
    layouts?: string[];
  }>(),
  generatedDesigns: jsonb("generated_designs").$type<{
    device: string;
    html: string;
    css: string;
    imageUrl?: string;
  }[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export const deviceTypes = [
  { id: "phone", name: "Phone", width: 375, height: 812, icon: "Smartphone" },
  { id: "tablet", name: "Tablet", width: 768, height: 1024, icon: "Tablet" },
  { id: "desktop", name: "Desktop", width: 1440, height: 900, icon: "Monitor" },
  { id: "watch", name: "Apple Watch", width: 368, height: 448, icon: "Watch" },
  { id: "vr", name: "VR/AR", width: 1920, height: 1080, icon: "Glasses" },
] as const;
