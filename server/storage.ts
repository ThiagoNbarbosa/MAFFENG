import { users, User, InsertUser, surveys, Survey, InsertSurvey, environments, Environment, InsertEnvironment, photos, Photo, InsertPhoto } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private surveys: Map<number, Survey>;
  private environments: Map<number, Environment>;
  private photos: Map<number, Photo>;
  
  userCurrentId: number;
  surveyCurrentId: number;
  environmentCurrentId: number;
  photoCurrentId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.surveys = new Map();
    this.environments = new Map();
    this.photos = new Map();
    
    this.userCurrentId = 1;
    this.surveyCurrentId = 1;
    this.environmentCurrentId = 1;
    this.photoCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Survey methods
  async createSurvey(insertSurvey: InsertSurvey): Promise<Survey> {
    const id = this.surveyCurrentId++;
    const survey: Survey = { 
      ...insertSurvey, 
      id, 
      createdAt: new Date() 
    };
    this.surveys.set(id, survey);
    return survey;
  }
  
  async getSurvey(id: number): Promise<Survey | undefined> {
    return this.surveys.get(id);
  }
  
  async getSurveysByUserId(userId: number): Promise<Survey[]> {
    return Array.from(this.surveys.values())
      .filter(survey => survey.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Environment methods
  async createEnvironment(insertEnvironment: InsertEnvironment): Promise<Environment> {
    const id = this.environmentCurrentId++;
    const environment: Environment = { ...insertEnvironment, id };
    this.environments.set(id, environment);
    return environment;
  }
  
  async getEnvironmentById(id: number): Promise<Environment | undefined> {
    return this.environments.get(id);
  }
  
  async getEnvironmentsBySurveyId(surveyId: number): Promise<Environment[]> {
    return Array.from(this.environments.values())
      .filter(env => env.surveyId === surveyId);
  }
  
  // Photo methods
  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = this.photoCurrentId++;
    const photo: Photo = { 
      ...insertPhoto, 
      id,
      createdAt: new Date()
    };
    this.photos.set(id, photo);
    return photo;
  }
  
  async getPhotosByEnvironmentId(environmentId: number): Promise<Photo[]> {
    return Array.from(this.photos.values())
      .filter(photo => photo.environmentId === environmentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
