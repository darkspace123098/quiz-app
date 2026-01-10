import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Try loading from both config directory and project root
config({ path: path.join(__dirname, ".env") });
config({ path: path.join(__dirname, "..", ".env") });
config({ path: path.join(__dirname, "..", "..", ".env") });

export const ADMIN_USERNAME = "admin";
export const SUPERADMIN_USERNAME = process.env.SUPERADMIN_USERNAME || "superadmin";
export const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || "superadmin123";
export const DEFAULT_CLASSES = ["BCA-I", "BCA-II", "BCA-III"];

export const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5000",
  "https://online-quiz-407o.onrender.com",
  "https://www.drfish.dev/",
];

