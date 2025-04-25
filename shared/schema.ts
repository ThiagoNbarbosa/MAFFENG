import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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
  userId: integer("user_id").notNull().references(() => users.id),
  agencyName: text("agency_name").notNull(),
  prefix: text("prefix").notNull(),
  // Endereço
  street: text("street").notNull(),
  number: text("number").notNull(),
  neighborhood: text("neighborhood").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  cep: text("cep").notNull(),
  // Responsável
  managerName: text("manager_name").notNull(),
  registration: text("registration").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSurveySchema = createInsertSchema(surveys).pick({
  userId: true,
  agencyName: true,
  prefix: true,
  street: true,
  number: true,
  neighborhood: true,
  city: true,
  state: true,
  cep: true,
  managerName: true,
  registration: true,
});

// Environment schema
export const environments = pgTable("environments", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").notNull().references(() => surveys.id),
  name: text("name").notNull(),
});

export const insertEnvironmentSchema = createInsertSchema(environments).pick({
  surveyId: true,
  name: true,
});

// Photo schema
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  environmentId: integer("environment_id").notNull().references(() => environments.id),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  surveys: many(surveys),
}));

export const surveysRelations = relations(surveys, ({ one, many }) => ({
  user: one(users, {
    fields: [surveys.userId],
    references: [users.id],
  }),
  environments: many(environments),
}));

export const environmentsRelations = relations(environments, ({ one, many }) => ({
  survey: one(surveys, {
    fields: [environments.surveyId],
    references: [surveys.id],
  }),
  photos: many(photos),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  environment: one(environments, {
    fields: [photos.environmentId],
    references: [environments.id],
  }),
}));
