import { db } from "../server/db";
import { users } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  try {
    // Check if the admin user already exists
    const existingAdmin = await db.select().from(users).where(eq(users.email, "admin@example.com"));
    
    if (existingAdmin.length > 0) {
      console.log("Admin user already exists");
      process.exit(0);
    }
    
    // Create admin user
    const password = await hashPassword("admin123");
    
    const [newUser] = await db.insert(users).values({
      username: "admin",
      email: "admin@example.com",
      password
    }).returning();
    
    console.log("Admin user created successfully:");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();