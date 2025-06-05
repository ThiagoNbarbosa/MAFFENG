import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, authenticateToken } from "./auth";
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

  // Middleware para verificar se o usuário é admin (usando email para identificar admin)
  const ensureAdmin = (req: any, res: any, next: any) => {
    if (req.user && req.user.email === "admin@maffeng.com") {
      return next();
    }
    res.status(403).json({ message: "Forbidden - Admin access required" });
  };

  // Admin routes removed - user management handled by Supabase Auth

  // Survey routes
  app.post("/api/surveys", authenticateToken, async (req, res) => {
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

  app.get("/api/surveys", authenticateToken, async (req, res) => {
    try {
      const surveys = await storage.getSurveysByUserId(req.user!.id);
      res.json(surveys);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch surveys" });
    }
  });

  app.get("/api/surveys/:id", authenticateToken, async (req, res) => {
    try {
      const surveyId = parseInt(req.params.id);
      const survey = await storage.getSurvey(surveyId);
      
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      if (survey.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(survey);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch survey" });
    }
  });

  // Environment routes
  app.post("/api/environments", authenticateToken, async (req, res) => {
    try {
      const environmentData = insertEnvironmentSchema.parse(req.body);
      
      // Check if the survey belongs to the user
      const survey = await storage.getSurvey(environmentData.surveyId);
      if (!survey || survey.userId !== req.user!.id) {
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

  app.get("/api/surveys/:surveyId/environments", authenticateToken, async (req, res) => {
    try {
      const surveyId = parseInt(req.params.surveyId);
      
      // Check if the survey belongs to the user
      const survey = await storage.getSurvey(surveyId);
      if (!survey || survey.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const environments = await storage.getEnvironmentsBySurveyId(surveyId);
      res.json(environments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch environments" });
    }
  });

  // Photo routes
  app.post("/api/photos", authenticateToken, async (req, res) => {
    console.log("API: Recebendo solicitação para salvar foto");
    try {
      console.log("API: Validando dados com schema...");
      
      // Verifica se a URL da imagem foi fornecida
      if (!req.body.imageUrl) {
        console.error("API: URL da imagem ausente");
        return res.status(400).json({ message: "Image URL is required" });
      }
      
      // Validando os dados com o schema
      const photoData = insertPhotoSchema.parse(req.body);
      console.log("API: Dados validados com sucesso!");
      
      // Log dos dados recebidos
      console.log("API: Dados recebidos:", {
        environmentId: photoData.environmentId,
        hasImageUrl: !!photoData.imageUrl,
        observation: photoData.observation ? 'presente' : 'ausente',
        photoType: photoData.photoType,
        hasPaintingDimensions: !!photoData.paintingDimensions
      });
      
      // Check if the environment's survey belongs to the user
      console.log(`API: Verificando ambiente ${photoData.environmentId}...`);
      const environment = await storage.getEnvironmentById(photoData.environmentId);
      if (!environment) {
        console.log(`API: Ambiente não encontrado: ${photoData.environmentId}`);
        return res.status(404).json({ message: "Environment not found" });
      }
      console.log(`API: Ambiente encontrado: ${environment.name}`);
      
      console.log(`API: Verificando pesquisa ${environment.surveyId}...`);
      const survey = await storage.getSurvey(environment.surveyId);
      if (!survey || survey.userId !== req.user.id) {
        console.log(`API: Não autorizado. ID do usuário: ${req.user.id}, ID do proprietário: ${survey?.userId}`);
        return res.status(403).json({ message: "Unauthorized" });
      }
      console.log(`API: Pesquisa encontrada. Usuário autorizado.`);
      
      // Preparar dados para criação da foto
      const photoInsertData = {
        ...photoData,
        // Se não tivermos imageData, usamos um valor padrão vazio
        imageData: photoData.imageData || ''
      };
      
      console.log("API: Salvando foto no banco de dados...");
      const photo = await storage.createPhoto(photoInsertData);
      console.log(`API: Foto salva com sucesso! ID: ${photo.id}`);
      res.status(201).json(photo);
    } catch (error) {
      console.error("API: Erro ao salvar foto:", error);
      if (error instanceof z.ZodError) {
        console.error("API: Erro de validação de dados:", error.errors);
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
