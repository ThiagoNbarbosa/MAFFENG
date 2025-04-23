import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

// Survey schema
export const surveys = pgTable("surveys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  agencyName: text("agency_name").notNull(),
  prefix: text("prefix").notNull(),
  managerName: text("manager_name").notNull(),
  registration: text("registration").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSurveySchema = createInsertSchema(surveys).pick({
  userId: true,
  agencyName: true,
  prefix: true,
  managerName: true,
  registration: true,
});

// Environment schema
export const environments = pgTable("environments", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").notNull(),
  name: text("name").notNull(),
});

export const insertEnvironmentSchema = createInsertSchema(environments).pick({
  surveyId: true,
  name: true,
});

// Photo schema
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  environmentId: integer("environment_id").notNull(),
  imageData: text("image_data").notNull(), // Base64 encoded image
  observation: text("observation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPhotoSchema = createInsertSchema(photos).pick({
  environmentId: true,
  imageData: true,
  observation: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Survey = typeof surveys.$inferSelect;
export type InsertSurvey = z.infer<typeof insertSurveySchema>;

export type Environment = typeof environments.$inferSelect;
export type InsertEnvironment = z.infer<typeof insertEnvironmentSchema>;

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
