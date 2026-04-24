import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import Result from "../models/Results.js";

const router = Router();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Upload directories ─────────────────────────────────────────────────────
const uploadsBase = path.join(__dirname, "..", "uploads");
const videosDir   = path.join(uploadsBase, "videos");
const logsDir     = path.join(uploadsBase, "logs");
const framesDir   = path.join(uploadsBase, "frames");

await fs.ensureDir(videosDir);
await fs.ensureDir(logsDir);
await fs.ensureDir(framesDir);

// ── Multer config ──────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, videosDir),
  filename: (req, _file, cb) => {
    const ts           = Date.now();
    const quizId       = (req.body.quizId       || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
    const contestantId = (req.body.contestantId || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
    // Format: QUIZCODE_USN_TIMESTAMP.webm  — easy to cross-reference
    cb(null, `${quizId}_${contestantId}_${ts}.webm`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: (_req, file, cb) => {
    // Accept video or audio; also covers "video/webm;codecs=vp9,opus"
    const baseType = (file.mimetype || "").split(";")[0].trim();
    const lowerName = (file.originalname || "").toLowerCase();
    const looksLikeMediaByName = lowerName.endsWith(".webm") || lowerName.endsWith(".wav") || lowerName.endsWith(".ogg");
    const isVideoField = file.fieldname === "video";

    // Some browsers/proxies can send MediaRecorder blobs as text/plain.
    // Accept it when filename still looks like a media recording.
    if (
      baseType.startsWith("video/") ||
      baseType.startsWith("audio/") ||
      baseType === "application/octet-stream" ||
      (baseType === "text/plain" && (looksLikeMediaByName || isVideoField))
    ) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});


// ══════════════════════════════════════════════════════════════════════════
// POST /api/proctor/upload-video
// Upload A/V recording with malpractice metadata; link to DB Result
// ══════════════════════════════════════════════════════════════════════════
router.post("/upload-video", upload.single("video"), async (req, res) => {
  try {
    const {
      quizId,
      contestantId,
      contestantName,
      durationChecks,
      totalMalpracticeEvents,
      malpracticeEvents,
      malpracticeDetails,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No video file uploaded" });
    }

    const videoFilename = req.file.filename;
    const videoPath     = req.file.path;
    const fileSize      = req.file.size;

    console.log(`[Proctor] Video uploaded: ${videoFilename} (${(fileSize / 1048576).toFixed(2)} MB)`);

    // ── Parse malpractice payload ────────────────────────────────────────
    let parsedEvents  = [];
    let parsedDetails = {};

    try { parsedEvents  = JSON.parse(malpracticeEvents  || "[]"); } catch (_) {}
    try { parsedDetails = JSON.parse(malpracticeDetails || "{}"); } catch (_) {}

    // ── Persist malpractice log ──────────────────────────────────────────
    const logFilename = `${quizId}_${contestantId}_${Date.now()}_malpractice.json`;
    const logPath     = path.join(logsDir, logFilename);

    const logData = {
      timestamp:             new Date().toISOString(),
      quizId,
      contestantId,
      contestantName,
      videoFile:             videoFilename,
      videoSizeBytes:        fileSize,
      videoSizeMB:           parseFloat((fileSize / 1048576).toFixed(2)),
      durationChecks:        parseInt(durationChecks)         || 0,
      totalMalpracticeEvents:parseInt(totalMalpracticeEvents) || 0,
      malpracticeEvents:     parsedEvents,
      malpracticeDetails:    parsedDetails,
    };

    await fs.writeJSON(logPath, logData, { spaces: 2 });
    console.log(`[Proctor] Malpractice log saved: ${logFilename}`);

    // ── Link to MongoDB Result ───────────────────────────────────────────
    try {
      // Upload may complete before quiz submission writes result.
      // Retry for a short window so recording still links to current attempt.
      let result = null;
      for (let attempt = 0; attempt < 12; attempt++) {
        result = await Result.findOne({ usn: contestantId, quizCode: quizId })
          .sort({ submittedAt: -1, createdAt: -1 });
        if (result) break;
        await sleep(1000);
      }

      if (result) {
        result.proctorVideoPath = videoFilename; // store just the filename for portability
        result.proctorLogPath = logFilename;
        result.malpracticeDetected = parseInt(totalMalpracticeEvents) > 0;
        result.malpracticeDetails = logData;
        await result.save();
        console.log(`[Proctor] Result updated with recording reference for ${contestantId}`);
      } else {
        console.warn(`[Proctor] No result found for USN=${contestantId} quizCode=${quizId} after retries — recording saved independently`);
      }
    } catch (dbErr) {
      console.warn("[Proctor] DB update failed (recording still saved):", dbErr.message);
    }

    res.json({
      status:              "success",
      message:             "Recording uploaded and stored successfully",
      videoFile:           videoFilename,
      videoSizeMB:         parseFloat((fileSize / 1048576).toFixed(2)),
      logFile:             logFilename,
      malpracticeCount:    parsedEvents.length,
    });
  } catch (err) {
    console.error("[Proctor] Upload error:", err);
    res.status(500).json({ status: "error", message: "Upload failed: " + err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// POST /api/proctor/log-event
// Stream a single malpractice event to a per-session JSONL file
// ══════════════════════════════════════════════════════════════════════════
router.post("/log-event", async (req, res) => {
  try {
    const {
      quizId, contestantId, contestantName,
      eventType, severity, description,
      faceCount, headOrientation, frameData,
    } = req.body;

    console.log(`[Proctor] Event: ${eventType} | ${severity} | ${contestantId}`);

    // Save frame snapshot for high-severity events
    let frameFilename = null;
    if (frameData && severity === "high") {
      frameFilename = `${quizId}_${contestantId}_${eventType}_${Date.now()}.jpg`;
      const framePath = path.join(framesDir, frameFilename);
      await fs.writeFile(framePath, Buffer.from(frameData, "base64"));
    }

    const eventEntry = {
      timestamp: new Date().toISOString(),
      quizId, contestantId, contestantName,
      eventType, severity, description,
      faceCount, headOrientation, frameFilename,
    };

    const logFile = path.join(logsDir, `${quizId}_${contestantId}_events.jsonl`);
    await fs.appendFile(logFile, JSON.stringify(eventEntry) + "\n");

    res.json({ status: "success", frameFilename });
  } catch (err) {
    console.error("[Proctor] log-event error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// GET /api/proctor/list
// List all stored recordings with metadata (used by admin Recordings page)
// ══════════════════════════════════════════════════════════════════════════
router.get("/list", async (_req, res) => {
  try {
    const files = await fs.readdir(videosDir);
    const webmFiles = files.filter(f => f.endsWith(".webm"));

    const recordings = await Promise.all(
      webmFiles.map(async (filename) => {
        const filePath = path.join(videosDir, filename);
        const stat     = await fs.stat(filePath);

        // Filename pattern: QUIZCODE_USN_TIMESTAMP.webm
        const parts       = filename.replace(".webm", "").split("_");
        const timestamp   = parseInt(parts[parts.length - 1]) || 0;
        const contestantId = parts.length >= 2 ? parts[parts.length - 2] : "unknown";
        const quizId      = parts.slice(0, parts.length - 2).join("_");

        // Try to find malpractice log
        let malpracticeData = null;
        try {
          const logFiles = await fs.readdir(logsDir);
          const matchLog = logFiles.find(
            f => f.includes(quizId) && f.includes(contestantId) && f.endsWith("_malpractice.json")
          );
          if (matchLog) {
            malpracticeData = await fs.readJSON(path.join(logsDir, matchLog));
          }
        } catch (_) {}

        // Try to find DB result
        let resultData = null;
        try {
          resultData = await Result.findOne(
            { usn: contestantId, quizCode: quizId },
            { score: 1, name: 1, className: 1, submittedAt: 1, malpracticeDetected: 1 }
          ).sort({ submittedAt: -1 }).lean();
        } catch (_) {}

        return {
          filename,
          quizId,
          contestantId,
          contestantName:   malpracticeData?.contestantName || resultData?.name || "Unknown",
          className:        resultData?.className || "—",
          recordedAt:       timestamp ? new Date(timestamp).toISOString() : stat.mtime.toISOString(),
          sizeMB:           parseFloat((stat.size / 1048576).toFixed(2)),
          durationChecks:   malpracticeData?.durationChecks || 0,
          malpracticeCount: malpracticeData?.totalMalpracticeEvents || 0,
          malpracticeDetected: (resultData?.malpracticeDetected === true || (malpracticeData?.totalMalpracticeEvents || 0) > 0),
          malpracticeEvents:   malpracticeData?.malpracticeEvents || [],
          malpracticeDetails:  malpracticeData?.malpracticeDetails || {},
          quizScore:        resultData?.score ?? null,
          submittedAt:      resultData?.submittedAt || null,
        };
      })
    );

    // Newest first
    recordings.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));

    res.json({ status: "success", count: recordings.length, recordings });
  } catch (err) {
    console.error("[Proctor] list error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// GET /api/proctor/stream/:filename
// Stream a video file to the browser (supports range requests for seeking)
// ══════════════════════════════════════════════════════════════════════════
router.get("/stream/:filename", async (req, res) => {
  try {
    const filename  = path.basename(req.params.filename); // prevent traversal
    const videoPath = path.join(videosDir, filename);

    if (!await fs.pathExists(videoPath)) {
      return res.status(404).json({ status: "error", message: "Recording not found" });
    }

    const stat       = await fs.stat(videoPath);
    const total      = stat.size;
    const range      = req.headers.range;

    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Type", "video/webm");

    if (range) {
      // Range request — enables seek in <video> element
      const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
      const start = parseInt(startStr, 10);
      const end   = endStr ? parseInt(endStr, 10) : total - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        "Content-Range":  `bytes ${start}-${end}/${total}`,
        "Content-Length": chunkSize,
      });
      fs.createReadStream(videoPath, { start, end }).pipe(res);
    } else {
      // Full file
      res.setHeader("Content-Length", total);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${filename}"`
      );
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    console.error("[Proctor] stream error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// GET /api/proctor/download/:filename
// Force-download a recording
// ══════════════════════════════════════════════════════════════════════════
router.get("/download/:filename", async (req, res) => {
  try {
    const filename  = path.basename(req.params.filename);
    const videoPath = path.join(videosDir, filename);

    if (!await fs.pathExists(videoPath)) {
      return res.status(404).json({ status: "error", message: "Recording not found" });
    }

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "video/webm");
    fs.createReadStream(videoPath).pipe(res);
  } catch (err) {
    console.error("[Proctor] download error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// DELETE /api/proctor/recording/:filename
// Delete a recording + its associated log/frames
// ══════════════════════════════════════════════════════════════════════════
router.delete("/recording/:filename", async (req, res) => {
  try {
    const filename  = path.basename(req.params.filename);
    const videoPath = path.join(videosDir, filename);

    if (!await fs.pathExists(videoPath)) {
      return res.status(404).json({ status: "error", message: "Recording not found" });
    }

    await fs.remove(videoPath);

    // Clean up associated log file if present
    const parts       = filename.replace(".webm", "").split("_");
    const contestantId = parts.length >= 2 ? parts[parts.length - 2] : null;
    const quizId      = parts.slice(0, parts.length - 2).join("_");

    if (contestantId && quizId) {
      try {
        const logFiles = await fs.readdir(logsDir);
        const matchLog = logFiles.find(
          f => f.includes(quizId) && f.includes(contestantId) && f.endsWith("_malpractice.json")
        );
        if (matchLog) await fs.remove(path.join(logsDir, matchLog));
      } catch (_) {}

      // Clear DB reference
      try {
        await Result.updateMany(
          { usn: contestantId, quizCode: quizId, proctorVideoPath: filename },
          { $set: { proctorVideoPath: null, proctorLogPath: null } }
        );
      } catch (_) {}
    }

    res.json({ status: "success", message: "Recording deleted" });
  } catch (err) {
    console.error("[Proctor] delete error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// GET /api/proctor/reports/:contestantId  (legacy — kept for compatibility)
// ══════════════════════════════════════════════════════════════════════════
router.get("/reports/:contestantId", async (req, res) => {
  try {
    const { contestantId } = req.params;
    const files = await fs.readdir(logsDir);
    const reports = [];

    for (const file of files.filter(f => f.includes(contestantId) && f.endsWith(".json"))) {
      try { reports.push(await fs.readJSON(path.join(logsDir, file))); } catch (_) {}
    }

    res.json({ status: "success", contestantId, reportCount: reports.length, reports });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// GET /api/proctor/frame/:filename
// Serve a malpractice snapshot image
// ══════════════════════════════════════════════════════════════════════════
router.get("/frame/:filename", async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const framePath = path.join(framesDir, filename);
    if (!await fs.pathExists(framePath)) return res.status(404).send("Not found");
    res.sendFile(framePath);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;

// Return JSON errors for upload failures (instead of default HTML error page)
router.use((err, _req, res, next) => {
  if (!err) return next();
  console.error("[Proctor] middleware error:", err);
  res.status(400).json({
    status: "error",
    message: err.message || "Upload failed",
  });
});
