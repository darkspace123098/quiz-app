import express from "express";
import Admin from "../models/Admin.js";
import Contestant from "../models/Contestant.js";
import Question from "../models/Question.js";
import Result from "../models/Results.js";
import ClassModel from "../models/Class.js";
import { requireAdmin } from "../middleware/auth.js";
import { getValidClasses } from "../utils/adminHelpers.js";
import { SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD } from "../config/constants.js";
import {
  adminLoginPage,
  generateAdminPage,
  overviewContent,
  contestantsContent,
  questionsContent,
  resultsContent,
  classesContent,
  addAdminContent
} from "../views/adminPages.js";

const router = express.Router();

// Debug route to check superadmin config (remove in production)
router.get("/debug/config", (req, res) => {
  res.json({
    superadminUsername: SUPERADMIN_USERNAME,
    superadminPasswordSet: !!SUPERADMIN_PASSWORD,
    superadminPasswordLength: SUPERADMIN_PASSWORD?.length || 0,
    superadminPasswordPreview: SUPERADMIN_PASSWORD ? SUPERADMIN_PASSWORD.substring(0, 3) + "..." : "not set",
    envSuperadminUsername: process.env.SUPERADMIN_USERNAME || "not set",
    envSuperadminPasswordSet: !!process.env.SUPERADMIN_PASSWORD,
    envSuperadminPasswordLength: process.env.SUPERADMIN_PASSWORD?.length || 0,
    note: "If env values show 'not set', check that .env file exists and is in the correct location"
  });
});

// Login routes
router.get("/login", (req, res) => {
  if (req.session && req.session.adminId) {
    return res.redirect("/admin/overview");
  }
  res.send(adminLoginPage);
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Trim whitespace from inputs
    const trimmedUsername = username.trim();
    const trimmedPassword = password;

    // Debug logging (remove in production)
    console.log("Login attempt:", {
      username: trimmedUsername,
      expectedUsername: SUPERADMIN_USERNAME,
      passwordProvided: !!trimmedPassword,
      expectedPasswordSet: !!SUPERADMIN_PASSWORD
    });

    const validClasses = await getValidClasses();
    
    // Check superadmin credentials (exact match, case-sensitive)
    if (trimmedUsername === SUPERADMIN_USERNAME && trimmedPassword === SUPERADMIN_PASSWORD) {
      req.session.adminId = "superadmin";
      req.session.adminUsername = SUPERADMIN_USERNAME;
      req.session.adminRole = "superadmin";
      req.session.adminClasses = validClasses;
      console.log("Superadmin login successful");
      return res.json({ status: "success" });
    }
    
    // Check regular admin credentials
    const admin = await Admin.findOne({ username: trimmedUsername });
    if (admin && admin.password === trimmedPassword) {
      req.session.adminId = admin._id.toString();
      req.session.adminUsername = admin.username;
      req.session.adminRole = admin.role || "admin";
      req.session.adminClasses = admin.managedClasses?.length
        ? admin.managedClasses
        : (Array.isArray(admin.classes) ? admin.classes.map(c => c.className) : []);
      console.log("Admin login successful:", admin.username);
      return res.json({ status: "success" });
    }
    
    console.log("Login failed: Invalid credentials");
    res.status(401).json({ message: "Invalid credentials" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ status: "success" });
  });
});

// Admin info routes
router.get("/role", requireAdmin, (req, res) => {
  res.json({
    username: req.session.adminUsername,
    role: req.session.adminRole || "admin",
    allowedClasses: req.session.adminClasses || []
  });
});

router.get("/data", requireAdmin, async (req, res) => {
  try {
    const allowedClasses = req.session.adminRole === "superadmin"
      ? await getValidClasses()
      : (req.session.adminClasses || []);

    const match = allowedClasses.length ? { className: { $in: allowedClasses } } : {};

    const totalContestants = await Contestant.countDocuments(match);
    const totalQuestions = await Question.countDocuments(match);
    const totalResults = await Result.countDocuments(match);
    const totalClasses = req.session.adminRole === "superadmin"
      ? allowedClasses.length
      : allowedClasses.length;
    
    res.json({
      status: "success",
      data: {
        totalClasses,
        totalContestants,
        totalQuestions,
        totalResults
      }
    });
  } catch (err) {
    console.error("Error fetching admin data:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Add admin route
router.post("/add", requireAdmin, async (req, res) => {
  try {
    if (req.session.adminRole !== "superadmin") {
      return res.status(403).json({ status: "error", message: "Only superadmin can add admins" });
    }
    
    const { username, password, classes } = req.body;
    
    if (!username || !password || !classes || !Array.isArray(classes)) {
      return res.status(400).json({ status: "error", message: "Invalid input" });
    }
    
    if (classes.length === 0) {
      return res.status(400).json({ status: "error", message: "At least one class must be selected" });
    }
    
    // Validate that all classes exist
    const validClasses = await getValidClasses();
    const invalidClasses = classes.filter(cls => !validClasses.includes(cls));
    if (invalidClasses.length > 0) {
      return res.status(400).json({ 
        status: "error", 
        message: `Invalid classes: ${invalidClasses.join(", ")}` 
      });
    }
    
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ status: "error", message: "Username already exists" });
    }
    
    // Build classes structure matching schema
    const classDocs = classes.map((cls) => ({
      className: cls.trim(),
      contestants: [],
      questions: [],
      results: []
    }));
    
    await Admin.create({
      username: username.trim(),
      password,
      role: "admin",
      managedClasses: classes.map(cls => cls.trim()),
      classes: classDocs
    });
    
    res.json({ status: "success", message: "Admin added successfully" });
  } catch (err) {
    console.error("Error adding admin:", err);
    // Provide more specific error messages
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        status: "error", 
        message: `Validation error: ${err.message}` 
      });
    }
    if (err.code === 11000) {
      return res.status(400).json({ 
        status: "error", 
        message: "Username already exists" 
      });
    }
    res.status(500).json({ status: "error", message: "Server error: " + err.message });
  }
});

// Page routes
router.get("/", requireAdmin, (req, res) => {
  res.redirect("/admin/overview");
});

router.get("/overview", requireAdmin, (req, res) => {
  res.send(generateAdminPage(overviewContent, 'overview'));
});

router.get("/contestants", requireAdmin, (req, res) => {
  res.send(generateAdminPage(contestantsContent, 'contestants'));
});

router.get("/questions", requireAdmin, (req, res) => {
  res.send(generateAdminPage(questionsContent, 'questions'));
});

router.get("/results", requireAdmin, (req, res) => {
  res.send(generateAdminPage(resultsContent, 'results'));
});

router.get("/classes", requireAdmin, (req, res) => {
  if (req.session.adminRole !== "superadmin") {
    return res.redirect("/admin/overview");
  }
  res.send(generateAdminPage(classesContent, 'classes'));
});

router.get("/add", requireAdmin, (req, res) => {
  if (req.session.adminRole !== "superadmin") {
    return res.redirect("/admin/overview");
  }
  res.send(generateAdminPage(addAdminContent, 'add'));
});

// Results API routes
router.get("/results/data", requireAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.session.adminRole !== "superadmin") {
      const classes = Array.isArray(req.session.adminClasses) ? req.session.adminClasses : [];
      filter.className = { $in: classes };
    }

    const results = await Result.find(filter)
      .sort({ submittedAt: -1, _id: -1 })
      .limit(200)
      .lean();

    res.json({ status: "success", results });
  } catch (err) {
    console.error("Error fetching results list:", err);
    res.status(500).json({ status: "error", message: "Server error fetching results" });
  }
});

router.delete("/results/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ status: "error", message: "Invalid result id" });
    }

    const result = await Result.findById(id);
    if (!result) {
      return res.status(404).json({ status: "error", message: "Result not found" });
    }

    if (req.session.adminRole !== "superadmin") {
      const classes = Array.isArray(req.session.adminClasses) ? req.session.adminClasses : [];
      if (!classes.includes(result.className)) {
        return res.status(403).json({ status: "error", message: "Not permitted to delete this result" });
      }
    }

    // Also delete the result from the contestant's results array
    if (result.contestant) {
      const contestant = await Contestant.findById(result.contestant);
      if (contestant && contestant.results && contestant.results.length > 0) {
        // Convert result.responses to a comparable format
        const resultResponses = result.responses;
        const resultScore = result.score;
        
        // Remove matching results from contestant's results array
        // Match by score and responses
        contestant.results = contestant.results.filter(contestantResult => {
          // If score doesn't match, keep it
          if (contestantResult.score !== resultScore) {
            return true;
          }
          
          // Compare responses - convert Map to object for comparison
          const contestantResponsesObj = contestantResult.responses instanceof Map 
            ? Object.fromEntries(contestantResult.responses)
            : contestantResult.responses;
          
          // Compare response objects
          const resultResponsesKeys = Object.keys(resultResponses || {}).sort();
          const contestantResponsesKeys = Object.keys(contestantResponsesObj || {}).sort();
          
          // If keys don't match, keep it
          if (resultResponsesKeys.length !== contestantResponsesKeys.length) {
            return true;
          }
          
          // Check if all key-value pairs match
          for (const key of resultResponsesKeys) {
            if (resultResponses[key] !== contestantResponsesObj[key]) {
              return true; // Keep this result as it doesn't match
            }
          }
          
          // If we get here, this result matches - remove it
          return false;
        });
        
        await contestant.save();
      }
    }

    await Result.deleteOne({ _id: id });
    res.json({ status: "success", message: "Result deleted" });
  } catch (err) {
    console.error("Error deleting result:", err);
    res.status(500).json({ status: "error", message: "Server error deleting result" });
  }
});

// Classes API routes
router.get("/classes/data", requireAdmin, async (req, res) => {
  try {
    const allClasses = await getValidClasses();
    const allowed = req.session.adminRole === "superadmin"
      ? allClasses
      : (req.session.adminClasses || []);
    const responseClasses = req.session.adminRole === "superadmin" ? allClasses : allowed;
    res.json({ status: "success", classes: responseClasses });
  } catch (err) {
    console.error("Error fetching classes:", err);
    res.status(500).json({ status: "error", message: "Server error fetching classes" });
  }
});

router.post("/classes/data", requireAdmin, async (req, res) => {
  try {
    if (req.session.adminRole !== "superadmin") {
      return res.status(403).json({ status: "error", message: "Only superadmin can add classes" });
    }
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ status: "error", message: "Class name is required" });
    }
    const className = name.trim();
    await ClassModel.updateOne({ name: className }, { name: className }, { upsert: true });
    res.json({ status: "success", message: "Class added" });
  } catch (err) {
    console.error("Error adding class:", err);
    res.status(500).json({ status: "error", message: "Server error adding class" });
  }
});

router.delete("/classes/data/:name", requireAdmin, async (req, res) => {
  try {
    if (req.session.adminRole !== "superadmin") {
      return res.status(403).json({ status: "error", message: "Only superadmin can delete classes" });
    }
    const name = decodeURIComponent(req.params.name || "").trim();
    if (!name) {
      return res.status(400).json({ status: "error", message: "Class name required" });
    }
    await ClassModel.deleteOne({ name });
    await Admin.updateMany(
      {},
      {
        $pull: {
          managedClasses: name,
          classes: { className: name }
        }
      }
    );
    res.json({ status: "success", message: "Class deleted" });
  } catch (err) {
    console.error("Error deleting class:", err);
    res.status(500).json({ status: "error", message: "Server error deleting class" });
  }
});

// Quiz time management routes
router.get("/classes/:name/time", requireAdmin, async (req, res) => {
  try {
    if (req.session.adminRole !== "superadmin") {
      return res.status(403).json({ status: "error", message: "Only superadmin can view quiz time" });
    }
    const name = decodeURIComponent(req.params.name || "").trim();
    if (!name) {
      return res.status(400).json({ status: "error", message: "Class name required" });
    }
    const classData = await ClassModel.findOne({ name });
    const quizTime = classData?.quizTime || 300;
    res.json({ status: "success", quizTime });
  } catch (err) {
    console.error("Error fetching quiz time:", err);
    res.status(500).json({ status: "error", message: "Server error fetching quiz time" });
  }
});

router.put("/classes/:name/time", requireAdmin, async (req, res) => {
  try {
    if (req.session.adminRole !== "superadmin") {
      return res.status(403).json({ status: "error", message: "Only superadmin can update quiz time" });
    }
    const name = decodeURIComponent(req.params.name || "").trim();
    const { quizTime } = req.body;
    if (!name) {
      return res.status(400).json({ status: "error", message: "Class name required" });
    }
    if (!quizTime || typeof quizTime !== 'number' || quizTime < 60 || quizTime > 3600) {
      return res.status(400).json({ status: "error", message: "Quiz time must be between 60 and 3600 seconds" });
    }
    await ClassModel.updateOne({ name }, { quizTime }, { upsert: true });
    res.json({ status: "success", message: "Quiz time updated successfully" });
  } catch (err) {
    console.error("Error updating quiz time:", err);
    res.status(500).json({ status: "error", message: "Server error updating quiz time" });
  }
});

// Fetch contestants for admin
router.get("/contestants/data", requireAdmin, async (req, res) => {
  try {
    const allowedClasses = req.session.adminRole === "superadmin"
      ? await getValidClasses()
      : (req.session.adminClasses || []);

    const match = allowedClasses.length ? { className: { $in: allowedClasses } } : {};

    const contestants = await Contestant.find(match)
      .select("name usn className quizCode quizPassword createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ status: "success", contestants });
  } catch (err) {
    console.error("Error fetching contestants:", err);
    res.status(500).json({ status: "error", message: "Server error fetching contestants" });
  }
});

// Fetch questions for admin
router.get("/questions/data", requireAdmin, async (req, res) => {
  try {
    const allowedClasses = req.session.adminRole === "superadmin"
      ? await getValidClasses()
      : (req.session.adminClasses || []);

    const match = allowedClasses.length ? { className: { $in: allowedClasses } } : {};

    const questions = await Question.find(match)
      .select("questionText options correctAnswer className quizCode createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ status: "success", questions });
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ status: "error", message: "Server error fetching questions" });
  }
});

export default router;

