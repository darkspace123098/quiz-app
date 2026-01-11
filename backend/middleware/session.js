import session from "express-session";
import MongoStore from "connect-mongo";

export const sessionMiddleware = session({
  name: "quiz.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
  }),
  cookie: {
    httpOnly: false,
    secure: true,        // REQUIRED on Render (HTTPS)
    sameSite: "none",    // REQUIRED for cross-origin
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
});

















