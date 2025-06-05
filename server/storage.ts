import { users, User, InsertUser, surveys, Survey, InsertSurvey, environments, Environment, InsertEnvironment, photos, Photo, InsertPhoto } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Métodos administrativos
export const getAllUsers = async (): Promise<User[]> => {
  return await db.select().from(users);
};

export const getAllSurveys = async (): Promise<Survey[]> => {
  return await db.select().from(surveys);
};

export interface IStorage {
  // Survey methods
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  getSurvey(id: number): Promise<Survey | undefined>;
  getSurveysByUserId(userId: string): Promise<Survey[]>;
  
  // Environment methods
  createEnvironment(environment: InsertEnvironment): Promise<Environment>;
  getEnvironmentById(id: number): Promise<Environment | undefined>;
  getEnvironmentsBySurveyId(surveyId: number): Promise<Environment[]>;
  
  // Photo methods
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  getPhotosByEnvironmentId(environmentId: number): Promise<Photo[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // No session store needed with Supabase auth
  }

  // User management is handled by Supabase Auth
  
  // Survey methods
  async createSurvey(insertSurvey: InsertSurvey): Promise<Survey> {
    const [survey] = await db.insert(surveys).values(insertSurvey).returning();
    return survey;
  }
  
  async getSurvey(id: number): Promise<Survey | undefined> {
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    return survey;
  }
  
  async getSurveysByUserId(userId: string): Promise<Survey[]> {
    return await db.select()
      .from(surveys)
      .where(eq(surveys.userId, userId))
      .orderBy(surveys.createdAt);
  }
  
  // Environment methods
  async createEnvironment(insertEnvironment: InsertEnvironment): Promise<Environment> {
    const [environment] = await db.insert(environments)
      .values(insertEnvironment)
      .returning();
    return environment;
  }
  
  async getEnvironmentById(id: number): Promise<Environment | undefined> {
    const [environment] = await db.select()
      .from(environments)
      .where(eq(environments.id, id));
    return environment;
  }
  
  async getEnvironmentsBySurveyId(surveyId: number): Promise<Environment[]> {
    return await db.select()
      .from(environments)
      .where(eq(environments.surveyId, surveyId));
  }
  
  // Photo methods
  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    // Ensure required fields are present with defaults
    const photoData = {
      environmentId: insertPhoto.environmentId!,
      photoType: insertPhoto.photoType!,
      imageData: insertPhoto.imageData || "",
      imageUrl: insertPhoto.imageUrl || null,
      observation: insertPhoto.observation || null,
      paintingDimensions: insertPhoto.paintingDimensions || null,
    };
    
    const [photo] = await db.insert(photos)
      .values(photoData)
      .returning();
    return photo;
  }
  
  async getPhotosByEnvironmentId(environmentId: number): Promise<Photo[]> {
    return await db.select()
      .from(photos)
      .where(eq(photos.environmentId, environmentId))
      .orderBy(photos.createdAt);
  }
}

export const storage = new DatabaseStorage();
