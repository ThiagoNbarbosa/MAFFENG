import { Express, Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

// Middleware to verify Supabase JWT token
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      id: user.id,
      email: user.email!
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token verification failed' });
  }
};

// Simplified setup for Supabase auth - no session management needed
export function setupAuth(app: Express) {
  // Get current user endpoint - validates token and returns user info
  app.get("/api/user", authenticateToken, (req, res) => {
    res.json({
      id: req.user!.id,
      email: req.user!.email
    });
  });
}
