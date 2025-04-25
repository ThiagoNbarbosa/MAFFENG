import { users, User, InsertUser, surveys, Survey, InsertSurvey, environments, Environment, InsertEnvironment, photos, Photo, InsertPhoto } from "@shared/schema";
import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { pool } from "./db";

const PostgresSessionStore = connectPgSimple(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Survey methods
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  getSurvey(id: number): Promise<Survey | undefined>;
  getSurveysByUserId(userId: number): Promise<Survey[]>;
  
  // Environment methods
  createEnvironment(environment: InsertEnvironment): Promise<Environment>;
  getEnvironmentById(id: number): Promise<Environment | undefined>;
  getEnvironmentsBySurveyId(surveyId: number): Promise<Environment[]>;
  
  // Photo methods
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  getPhotosByEnvironmentId(environmentId: number): Promise<Photo[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Survey methods
  async createSurvey(insertSurvey: InsertSurvey): Promise<Survey> {
    const [survey] = await db.insert(surveys).values(insertSurvey).returning();
    return survey;
  }
  
  async getSurvey(id: number): Promise<Survey | undefined> {
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    return survey;
  }
  
  async getSurveysByUserId(userId: number): Promise<Survey[]> {
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
    const [photo] = await db.insert(photos)
      .values(insertPhoto)
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
