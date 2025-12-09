import { Router } from "express";
import mongoose from "mongoose";
import Question from "../models/Question.js";
import Contestant from "../models/Contestant.js";
import Result from "../models/Results.js";
import Admin from "../models/Admin.js";
import ClassModel from "../models/Class.js";

const router = Router();

const DEFAULT_CLASSES = ["BCA-I", "BCA-II", "BCA-III"];
const ADMIN_USERNAME = "admin";

async function getValidClasses() {
  const classes = await ClassModel.find({}).lean();
  if (!classes || classes.length === 0) {
    await ClassModel.insertMany(DEFAULT_CLASSES.map((name) => ({ name })), { ordered: false });
    return DEFAULT_CLASSES;
  }
  return classes.map((c) => c.name);
}

function isSuperAdmin(req) {
  return req.session && req.session.adminRole === "superadmin";
}

function getAdminClasses(req) {
  if (isSuperAdmin(req)) return null; // all classes allowed
  return Array.isArray(req.session?.adminClasses) ? req.session.adminClasses : [];
}

function ensureAdminSession(req, res) {
  if (!req.session || !req.session.adminId) {
    res.status(401).json({ status: "error", message: "Unauthorized" });
    return false;
  }
  return true;
}

router.post("/contestant", async (req, res) => {
  try {
    if (!ensureAdminSession(req, res)) return;
    const { students } = req.body;
    const validClasses = await getValidClasses();

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ status: "error", message: "No student data provided" });
    }

    // Validate each student
    for (const student of students) {
      if (!student.name || !student.usn || !student.className || !student.quizCode || !student.quizPassword) {
        return res.status(400).json({ 
          status: "error", 
          message: "Each student must have name, usn, className, quizCode, and quizPassword" 
        });
      }
      if (!validClasses.includes(student.className.trim())) {
        return res.status(400).json({ 
          status: "error", 
          message: `Invalid className. Must be one of: ${validClasses.join(", ")}` 
        });
      }
      const allowed = getAdminClasses(req);
      if (allowed && !allowed.includes(student.className.trim())) {
        return res.status(403).json({
          status: "error",
          message: "You are not permitted to add contestants for this class"
        });
      }
    }

    const normalizedStudents = students.map(student => ({
      ...student,
      className: student.className?.trim(),
      usn: student.usn?.trim().toUpperCase(),
      name: student.name?.trim(),
      quizCode: student.quizCode?.trim(),
      quizPassword: student.quizPassword?.trim()
    }));

    const inserted = await Contestant.insertMany(normalizedStudents, { ordered: false });

    const groupedByClass = inserted.reduce((acc, doc) => {
      acc[doc.className] = acc[doc.className] || [];
      acc[doc.className].push(doc._id);
      return acc;
    }, {});

    await Promise.all(
      Object.entries(groupedByClass).map(([className, ids]) =>
        addReferencesToAdmin(className, "contestants", ids)
      )
    );

    res.json({ status: "success", message: "Contestants added successfully" });
  } catch (err) {
    console.error("Failed to add contestants:", err);
    if (err.code === 11000) {
      return res.status(400).json({ 
        status: "error", 
        message: "One or more USNs already exist" 
      });
    }
    res.status(500).json({ 
      status: "error", 
      message: err.message || "Server error" 
    });
  }
});

// Update contestant (only within admin's classes)
router.put("/contestant/:id", async (req, res) => {
  try {
    if (!ensureAdminSession(req, res)) return;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "error", message: "Invalid contestant id" });
    }
    const contestant = await Contestant.findById(id);
    if (!contestant) return res.status(404).json({ status: "error", message: "Contestant not found" });

    const allowed = getAdminClasses(req);
    if (allowed && !allowed.includes(contestant.className)) {
      return res.status(403).json({ status: "error", message: "Not permitted for this class" });
    }

    const { name, usn, className, quizCode, quizPassword } = req.body;
    const validClasses = await getValidClasses();
    if (className && !validClasses.includes(className)) {
      return res.status(400).json({ status: "error", message: "Invalid className" });
    }
    if (className && allowed && !allowed.includes(className)) {
      return res.status(403).json({ status: "error", message: "Not permitted to move to that class" });
    }

    if (name) contestant.name = name.trim();
    if (usn) contestant.usn = usn.trim().toUpperCase();
    if (className) contestant.className = className;
    if (quizCode) contestant.quizCode = quizCode.trim();
    if (quizPassword !== undefined) contestant.quizPassword = quizPassword.trim();

    await contestant.save();
    res.json({ status: "success", message: "Contestant updated", contestant });
  } catch (err) {
    console.error("Error updating contestant:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Delete contestant
router.delete("/contestant/:id", async (req, res) => {
  try {
    if (!ensureAdminSession(req, res)) return;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "error", message: "Invalid contestant id" });
    }
    const contestant = await Contestant.findById(id);
    if (!contestant) return res.status(404).json({ status: "error", message: "Contestant not found" });

    const allowed = getAdminClasses(req);
    if (allowed && !allowed.includes(contestant.className)) {
      return res.status(403).json({ status: "error", message: "Not permitted for this class" });
    }

    await Contestant.deleteOne({ _id: id });
    res.json({ status: "success", message: "Contestant deleted" });
  } catch (err) {
    console.error("Error deleting contestant:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Update contestant password/quizCode by USN (convenience)
router.put("/contestant/password", async (req, res) => {
  try {
    if (!ensureAdminSession(req, res)) return;
    const { usn, quizPassword, quizCode } = req.body;
    if (!usn) return res.status(400).json({ status: "error", message: "USN is required" });

    const contestant = await Contestant.findOne({ usn: usn.trim().toUpperCase() });
    if (!contestant) return res.status(404).json({ status: "error", message: "Contestant not found" });

    const allowed = getAdminClasses(req);
    if (allowed && !allowed.includes(contestant.className)) {
      return res.status(403).json({ status: "error", message: "Not permitted for this class" });
    }

    if (quizPassword !== undefined) contestant.quizPassword = quizPassword.trim();
    if (quizCode) contestant.quizCode = quizCode.trim();

    await contestant.save();
    res.json({ status: "success", message: "Contestant credentials updated" });
  } catch (err) {
    console.error("Error updating contestant password:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});
router.post("/question", async (req, res) => {
  try {
    if (!ensureAdminSession(req, res)) return;
    if (!isSuperAdmin(req)) {
      return res.status(403).json({ status: "error", message: "Only superadmin can create questions" });
    }
    const { className, questionText, options, correctAnswer, quizCode } = req.body;
    const validClasses = await getValidClasses();

    // Validation 1: Required fields
    if (!className || !quizCode || !questionText || !Array.isArray(options) || options.length !== 4 || !correctAnswer) {
      return res.status(400).json({
        status: "error",
        message: "Provide className, quizCode, questionText, 4 options, and correctAnswer."
      });
    }

    // Validation 2: className allowed?
    if (!validClasses.includes(className)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid className."
      });
    }

    // Validation 3: Correct answer must match one of the options
    if (!options.includes(correctAnswer)) {
      return res.status(400).json({
        status: "error",
        message: "Correct answer must match one of the options."
      });
    }

    // Save to MongoDB
    const question = await Question.create({
      className,
      quizCode: quizCode.trim(),
      questionText,
      options,
      correctAnswer
    });

    // Add reference to admin (non-blocking, log errors but don't fail)
    try {
      await addReferencesToAdmin(className, "questions", [question._id]);
    } catch (refError) {
      console.error("Error adding reference to admin (non-critical):", refError);
      // Continue even if reference update fails
    }

    res.status(201).json({
      status: "success",
      message: "Question added successfully",
      question
    });

  } catch (err) {
    console.error("Error adding question:", err);
    res.status(500).json({ 
      status: "error", 
      message: err.message || "Server error",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Update a question (superadmin only)
router.put("/question/:id", async (req, res) => {
  try {
    if (!ensureAdminSession(req, res)) return;
    if (!isSuperAdmin(req)) {
      return res.status(403).json({ status: "error", message: "Only superadmin can update questions" });
    }
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "error", message: "Invalid question id" });
    }
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ status: "error", message: "Question not found" });

    const { questionText, options, correctAnswer, quizCode } = req.body;
    if (!questionText || !Array.isArray(options) || options.length !== 4 || !correctAnswer) {
      return res.status(400).json({ status: "error", message: "Provide questionText, 4 options, and correctAnswer." });
    }
    if (!options.includes(correctAnswer)) {
      return res.status(400).json({ status: "error", message: "Correct answer must match one of the options." });
    }

    question.questionText = questionText.trim();
    question.options = options;
    question.correctAnswer = correctAnswer;
    if (quizCode) question.quizCode = quizCode.trim();
    await question.save();

    res.json({ status: "success", message: "Question updated", question });
  } catch (err) {
    console.error("Error updating question:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Delete question (superadmin only)
router.delete("/question/:id", async (req, res) => {
  try {
    if (!ensureAdminSession(req, res)) return;
    if (!isSuperAdmin(req)) {
      return res.status(403).json({ status: "error", message: "Only superadmin can delete questions" });
    }
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "error", message: "Invalid question id" });
    }
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ status: "error", message: "Question not found" });

    await Question.deleteOne({ _id: id });
    res.json({ status: "success", message: "Question deleted" });
  } catch (err) {
    console.error("Error deleting question:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});


router.post("/", async (req, res) => {
  try {
    const { name, usn, responses } = req.body;
    
    if (!usn) {
      return res.status(400).json({ status: "error", message: "USN is required" });
    }

    if (!responses || typeof responses !== 'object' || Object.keys(responses).length === 0) {
      return res.status(400).json({ status: "error", message: "No responses provided" });
    }

    let score = 0;

    const contestant1 = await Contestant.findOne({ usn: usn.trim().toUpperCase() });
    if (!contestant1) {
      return res.status(400).json({ status: "error", message: "Contestant not found" });
    }

    // Check if quiz was already attempted
    if (contestant1.results && contestant1.results.length > 0) {
      return res.status(403).json({ status: "error", message: "Quiz already attempted" });
    }

    const questionIds = Object.keys(responses)
      .filter(id => mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id));
    
    if (questionIds.length === 0) {
      return res.status(400).json({ status: "error", message: "Invalid question IDs" });
    }

    const questions = await Question.find({ _id: { $in: questionIds } });

    if (questions.length === 0) {
      return res.status(400).json({ status: "error", message: "No valid questions found" });
    }

    questions.forEach((question) => {
      const qid = question._id.toString();
      if (responses[qid] === question.correctAnswer) {
        score++;
      }
    });

    contestant1.results.push({
      responses,
      score
    });

    const resultDoc = await Result.create({
      contestant: contestant1._id,
      className: contestant1.className,
      quizCode: contestant1.quizCode,
      name: contestant1.name,
      usn: contestant1.usn,
      responses,
      score
    });

    await contestant1.save();
    await addReferencesToAdmin(contestant1.className, "results", [resultDoc._id]);

    // Get detailed results for response
    const totalQuestions = questions.length;
    const correctAnswers = questions.map(q => ({
      questionId: q._id.toString(),
      questionText: q.questionText,
      correctAnswer: q.correctAnswer,
      userAnswer: responses[q._id.toString()] || "Not answered"
    }));

    res.json({ 
      status: "success", 
      score,
      totalQuestions,
      name: contestant1.name,
      usn: contestant1.usn,
      className: contestant1.className,
      correctAnswers
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});
function getClassFromUSN(usn) {
  if (usn.includes("TY23")) return "BCA-III";
  if (usn.includes("TY24")) return "BCA-II";
  if (usn.includes("TY25")) return "BCA-I";
  return null; // unknown
}
router.get("/random", async (req, res) => {
  try {
    const { usn, quizCode, password } = req.query;
    
    if (!usn || !quizCode || !password) {
      return res.status(400).json({ error: "USN, quizCode, and password are required" });
    }

    const contestant = await Contestant.findOne({ usn: usn.trim().toUpperCase() });

    if (!contestant) {
      return res.status(404).json({ error: "Contestant not found" });
    }

    // Check if quiz was already attempted
    if (contestant.results && contestant.results.length > 0) {
      return res.status(403).json({ error: "Quiz already attempted" });
    }

    // Validate quiz code and password
    if (contestant.quizCode !== quizCode.trim()) {
      return res.status(403).json({ error: "Invalid quiz code for this contestant" });
    }
    if (contestant.quizPassword !== password) {
      return res.status(403).json({ error: "Invalid password for this contestant" });
    }

    const className = contestant.className;

    const questions = await Question.aggregate([
      { $match: { className, quizCode: quizCode.trim() } },
      { $sample: { size: 5 } },
      {
        $project: {
          _id: 1,
          questionText: 1,
          options: 1,
        }
      }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ error: "No questions available for this quiz code" });
    }

    // Get quiz time for this class
    const classData = await ClassModel.findOne({ name: className });
    const quizTime = classData?.quizTime || 300; // Default to 5 minutes if not set

    const response = {
      name: contestant.name,
      questions: questions,
      quizTime: quizTime
    };

    res.json(response);

  } catch (err) {
    console.error("Error fetching quiz questions:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

export default router;

async function ensureAdminStructure() {
  const validClasses = await getValidClasses();
  await Admin.updateOne(
    { username: ADMIN_USERNAME },
    {
      $setOnInsert: {
        username: ADMIN_USERNAME,
        managedClasses: validClasses,
        classes: validClasses.map(className => ({
          className,
          contestants: [],
          questions: [],
          results: []
        }))
      }
    },
    { upsert: true }
  );
}

async function addReferencesToAdmin(className, field, ids) {
  const validClasses = await getValidClasses();
  if (!validClasses.includes(className) || !ids || ids.length === 0) return;

  await ensureAdminStructure();

  await Admin.updateOne(
    { username: ADMIN_USERNAME, classes: { $not: { $elemMatch: { className } } } },
    {
      $push: {
        classes: {
          className,
          contestants: [],
          questions: [],
          results: []
        }
      }
    }
  );

  const path = `classes.$.${field}`;
  await Admin.updateOne(
    { username: ADMIN_USERNAME, "classes.className": className },
    {
      $addToSet: {
        [path]: { $each: ids }
      }
    }
  );
}
