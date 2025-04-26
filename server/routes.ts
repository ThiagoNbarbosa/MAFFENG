import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertSurveySchema, insertEnvironmentSchema, insertPhotoSchema } from "@shared/schema";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar body-parser para aceitar payloads maiores
  app.use(express.json({limit: '100mb'}));
  app.use(express.urlencoded({limit: '100mb', extended: true}));
  app.use(express.raw({limit: '100mb'}));
  // Setup auth routes
  setupAuth(app);

  // API middleware to ensure user is authenticated
  const ensureAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Middleware para verificar se o usuário é admin
  const ensureAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.username === "admin") {
      return next();
    }
    res.status(403).json({ message: "Forbidden - Admin access required" });
  };

  // Rotas administrativas
  app.get("/api/admin/users", ensureAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/surveys", ensureAdmin, async (req, res) => {
    try {
      const allSurveys = await storage.getAllSurveys();
      res.json(allSurveys);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch surveys" });
    }
  });

  // Survey routes
  app.post("/api/surveys", ensureAuthenticated, async (req, res) => {
    try {
      const surveyData = insertSurveySchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const survey = await storage.createSurvey(surveyData);
      res.status(201).json(survey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid survey data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create survey" });
    }
  });

  app.get("/api/surveys", ensureAuthenticated, async (req, res) => {
    try {
      const surveys = await storage.getSurveysByUserId(req.user.id);
      res.json(surveys);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch surveys" });
    }
  });

  app.get("/api/surveys/:id", ensureAuthenticated, async (req, res) => {
    try {
      const surveyId = parseInt(req.params.id);
      const survey = await storage.getSurvey(surveyId);
      
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      if (survey.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(survey);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch survey" });
    }
  });

  // Environment routes
  app.post("/api/environments", ensureAuthenticated, async (req, res) => {
    try {
      const environmentData = insertEnvironmentSchema.parse(req.body);
      
      // Check if the survey belongs to the user
      const survey = await storage.getSurvey(environmentData.surveyId);
      if (!survey || survey.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const environment = await storage.createEnvironment(environmentData);
      res.status(201).json(environment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid environment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create environment" });
    }
  });

  app.get("/api/surveys/:surveyId/environments", ensureAuthenticated, async (req, res) => {
    try {
      const surveyId = parseInt(req.params.surveyId);
      
      // Check if the survey belongs to the user
      const survey = await storage.getSurvey(surveyId);
      if (!survey || survey.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const environments = await storage.getEnvironmentsBySurveyId(surveyId);
      res.json(environments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch environments" });
    }
  });

  // Photo routes
  app.post("/api/photos", ensureAuthenticated, async (req, res) => {
    try {
      const photoData = insertPhotoSchema.parse(req.body);
      
      // Check if the environment's survey belongs to the user
      const environment = await storage.getEnvironmentById(photoData.environmentId);
      if (!environment) {
        return res.status(404).json({ message: "Environment not found" });
      }
      
      const survey = await storage.getSurvey(environment.surveyId);
      if (!survey || survey.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const photo = await storage.createPhoto(photoData);
      res.status(201).json(photo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid photo data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save photo" });
    }
  });

  app.get("/api/environments/:environmentId/photos", ensureAuthenticated, async (req, res) => {
    try {
      const environmentId = parseInt(req.params.environmentId);
      
      // Check if the environment's survey belongs to the user
      const environment = await storage.getEnvironmentById(environmentId);
      if (!environment) {
        return res.status(404).json({ message: "Environment not found" });
      }
      
      const survey = await storage.getSurvey(environment.surveyId);
      if (!survey || survey.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const photos = await storage.getPhotosByEnvironmentId(environmentId);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
