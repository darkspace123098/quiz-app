import session from "express-session";

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "quiz-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 60 * 1000, // 1 hour
    httpOnly: true,
    sameSite: "lax",
    secure: false // Set to true in production with HTTPS
  }
});

