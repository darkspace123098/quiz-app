/**
 * Proctor Monitor v2.2 - Real-time proctoring system for online quizzes
 * ─────────────────────────────────────────────────────────────────────
 * • Video + Audio recording (WebM) — guaranteed upload before page nav
 * • Face detection via face-api.js (TinyFaceDetector — no landmarks needed)
 * • INSTANT quiz termination when ≥ 2 faces are detected
 * • No-face-detected malpractice tracking
 */

class ProctorMonitor {
  constructor(options = {}) {
    this.videoElement    = options.videoElement;   // SINGLE element (visible preview)
    this.canvasElement   = options.canvasElement;
    this.quizId          = options.quizId          || "unknown";
    this.contestantId    = options.contestantId    || "unknown";
    this.contestantName  = options.contestantName  || "unknown";
    this.apiBaseUrl      = options.apiBaseUrl       || "/api/proctor";
    this.checkInterval   = options.checkInterval   || 1500;   // ms between scans
    this.captureFrameInterval = options.captureFrameInterval || 5000;

    this.enabled      = false;
    this.monitoring   = false;
    this.modelsLoaded = false;

    this.lastFrameCapture = 0;
    this.eventCallbacks   = {};

    // ── Detection thresholds ─────────────────────────────────────────────
    this.thresholds = {
      noFaceMax: 12000,           // 12s total out of frame = quiz end
    };

    // ── State ────────────────────────────────────────────────────────────
    this.state = {
      noFaceTime:                 0,
      malpracticeEvents:          [],
      quizEndedByMultipleFaces:   false,
      quizEndedByNoFace:          false,
    };

    this.stats = {
      totalChecks:        0,
      malpracticeDetected: 0,
      multipleFacesEvents: 0,
    };

    // ── Recording ────────────────────────────────────────────────────────
    this.mediaRecorder  = null;
    this.recordedChunks = [];
    this.stream         = null;
    this._uploadPromise = null;   // track pending upload
    this.timer = null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EVENTS
  // ═══════════════════════════════════════════════════════════════════════

  on(event, cb)       { (this.eventCallbacks[event] = this.eventCallbacks[event] || []).push(cb); }
  emit(event, data)   { (this.eventCallbacks[event] || []).forEach(cb => cb(data)); }

  // ═══════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════

  async initialize() {
    try {
      const cdnUrl = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.min.js";
      console.log("[Proctor] Loading face-api from CDN…");

      if (!window.faceapi) {
        await Promise.race([
          this._loadScript(cdnUrl),
          new Promise((_, rej) => setTimeout(() => rej(new Error("CDN timeout")), 12000)),
        ]);
      }

      if (!window.faceapi) throw new Error("face-api.js not available after load");

      await this._loadModels();
      this.modelsLoaded = true;
      console.log("[Proctor] Initialized ✓");
      this.emit("initialized", { message: "Proctor monitor initialized" });
      return true;
    } catch (err) {
      console.error("[Proctor] Init failed:", err);
      this.emit("error", { message: `Face detection unavailable: ${err.message}`, isCritical: false });
      return false;
    }
  }

  async _loadModels() {
    const modelBase = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
    await window.faceapi.nets.tinyFaceDetector.loadFromUri(modelBase);
    console.log("[Proctor] TinyFaceDetector model loaded ✓");
  }

  _loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement("script");
      s.src = src; s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(s);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // START / STOP
  // ═══════════════════════════════════════════════════════════════════════

  async startMonitoring() {
    if (!this.modelsLoaded) {
      const ok = await this.initialize();
      if (!ok) console.warn("[Proctor] Continuing without face detection");
    }

    try {
      if (!this.videoElement) throw new Error("No video element provided");

      console.log("[Proctor] Requesting camera + microphone…");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
      });

      this.stream = stream;

      // Attach to the single video element (visible preview)
      this.videoElement.srcObject    = stream;
      this.videoElement.muted        = true;
      this.videoElement.autoplay     = true;
      this.videoElement.playsInline  = true;
      await this.videoElement.play().catch(e => console.warn("[Proctor] play():", e));

      // Canvas sizing
      this._setupCanvas();
      this.videoElement.addEventListener("loadedmetadata", () => this._setupCanvas(), { once: true });

      this.monitoring = true;
      this.enabled    = true;

      // ── MediaRecorder (video + audio) ───────────────────────────────────
      try {
        this.recordedChunks = [];
        
        let options = { mimeType: 'video/webm;codecs=vp8,opus' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: 'video/webm;codecs=vp9,opus' };
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'video/webm' };
          }
        }

        this.mediaRecorder = new MediaRecorder(stream, options);
        this.mediaRecorder.ondataavailable = e => { if (e.data && e.data.size > 0) this.recordedChunks.push(e.data); };
        this.mediaRecorder.start(1000);   // flush every 1 s
        const actualMime = this.mediaRecorder.mimeType || "default";
        console.log(`[Proctor] Recording started (${actualMime})`);
        this.emit("recording_started", { mimeType: actualMime });
      } catch (recErr) {
        console.error("[Proctor] MediaRecorder error:", recErr);
      }

      this._monitorLoop();
      this.emit("started", { message: "Camera monitoring active — recording audio & video" });
      return true;
    } catch (err) {
      console.error("[Proctor] startMonitoring error:", err);
      const msg =
        err.name === "NotAllowedError" ? "Camera permission denied. Allow camera and refresh." :
        err.name === "NotFoundError"   ? "No camera found on this device." :
        `Camera error: ${err.message}`;
      this.emit("error", { message: msg, isCritical: false });
      return false;
    }
  }

  /**
   * Stop monitoring and WAIT for the recording upload to finish.
   * Always returns a Promise so callers can await it.
   */
  async stopMonitoring() {
    if (!this.monitoring && !this.enabled) {
      // Already stopped — return any pending upload promise
      return this._uploadPromise || Promise.resolve();
    }

    this.monitoring = false;
    this.enabled    = false;
    
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Stop recorder and wait for upload FIRST, to avoid truncating audio/video abruptly
    this._uploadPromise = new Promise(resolve => {
      const finishAndStopTracks = async () => {
        // Now that recorder is stopped, stop camera tracks
        if (this.stream) {
          this.stream.getTracks().forEach(t => t.stop());
        }
        if (this.videoElement) {
          this.videoElement.srcObject = null;
        }
        await this._uploadRecording();
        resolve();
      };

      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.onstop = finishAndStopTracks;
        this.mediaRecorder.stop();
      } else {
        finishAndStopTracks();
      }
    });

    this.emit("stopped", { message: "Monitoring stopped" });
    return this._uploadPromise;
  }

  /**
   * Called by the quiz before navigating away.
   * Ensures the upload finishes even if stopMonitoring was already called.
   */
  async waitForUpload() {
    if (this._uploadPromise) {
      console.log("[Proctor] Waiting for recording upload to finish…");
      await this._uploadPromise;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RECORDING UPLOAD
  // ═══════════════════════════════════════════════════════════════════════

  async _uploadRecording() {
    if (!this.recordedChunks || this.recordedChunks.length === 0) {
      console.warn("[Proctor] No video chunks to upload — skipping");
      return;
    }

    const mimeType = this.mediaRecorder ? this.mediaRecorder.mimeType : "video/webm";
    const blob     = new Blob(this.recordedChunks, { type: mimeType });
    const sizeMB   = (blob.size / 1048576).toFixed(2);

    console.log(`[Proctor] Uploading A/V recording: ${sizeMB} MB (${this.recordedChunks.length} chunks)…`);

    const fd = new FormData();
    fd.append("quizId",               this.quizId);
    fd.append("contestantId",         this.contestantId);
    fd.append("contestantName",       this.contestantName);
    fd.append("durationChecks",       String(this.stats.totalChecks));
    fd.append("totalMalpracticeEvents", String(this.stats.malpracticeDetected));
    fd.append("malpracticeEvents",    JSON.stringify(this.state.malpracticeEvents));
    fd.append("malpracticeDetails",   JSON.stringify({
      multipleFacesEvents:       this.stats.multipleFacesEvents,
      quizEndedByMultipleFaces:  this.state.quizEndedByMultipleFaces,
      noFaceTime:                this.state.noFaceTime,
      totalAlerts:               this.stats.malpracticeDetected,
    }));
    fd.append("video",                blob, `${this.quizId}_${this.contestantId}_proctor.webm`);

    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(`${this.apiBaseUrl}/upload-video`, {
          method: "POST",
          body: fd
        });

        if (!res.ok) {
          let message = `HTTP ${res.status}`;
          try {
            const maybeJson = await res.json();
            message = maybeJson?.message || maybeJson?.error || message;
          } catch (_) {
            message = await res.text().catch(() => message);
          }
          throw new Error(message);
        }

        const data = await res.json();
        console.log("[Proctor] Upload successful ✓", data);
        this.emit("recording_uploaded", { success: true, size: blob.size, sizeMB: parseFloat(sizeMB) });
        return;
      } catch (err) {
        lastError = err;
        console.warn(`[Proctor] Upload attempt ${attempt} failed:`, err.message);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1200));
        }
      }
    }

    console.error("[Proctor] Upload failed:", lastError);
    this.emit("recording_upload_failed", { error: lastError?.message || "Unknown upload error" });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CANVAS
  // ═══════════════════════════════════════════════════════════════════════

  _setupCanvas() {
    if (!this.canvasElement || !this.videoElement) return;
    const w = this.videoElement.videoWidth  || 640;
    const h = this.videoElement.videoHeight || 480;
    this.canvasElement.width  = w;
    this.canvasElement.height = h;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN DETECTION LOOP
  // ═══════════════════════════════════════════════════════════════════════

  _monitorLoop() {
    if (!this.monitoring) return;

    const vid = this.videoElement;
    if (!vid || vid.paused || vid.readyState < 2) {
      if (vid && vid.paused) vid.play().catch(() => {});
      this.timer = setTimeout(() => this._monitorLoop(), 500);
      return;
    }

    this._detectAndAnalyze();
    this.timer = setTimeout(() => this._monitorLoop(), this.checkInterval);
  }

  async _detectAndAnalyze() {
    const vid = this.videoElement;
    if (!vid || vid.paused || !this.monitoring) return;

    try {
      const faceapi = window.faceapi;
      if (!faceapi || !faceapi.detectAllFaces) {
        this.stats.totalChecks++;
        this.emit("face_count_update", { count: 0 });
        return;
      }

      let detections = [];
      try {
        detections = await faceapi.detectAllFaces(
          vid,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 })
        );
      } catch (e) {
        console.warn("[Proctor] Detection error:", e.message);
        this.stats.totalChecks++;
        return;
      }

      this.stats.totalChecks++;
      const count = detections.length;

      console.debug(`[Proctor] Scan #${this.stats.totalChecks}: ${count} face(s)`);

      // Emit live face count for the UI badge
      this.emit("face_count_update", { count });
      if (count > 0) this.emit("face_detected", { count });

      // ── MULTIPLE FACES ─────────────────────────────────────────────────
      if (count >= 2) {
        this._handleMultipleFaces(count);
        return;
      }

      // ── NO FACE DETECTED ───────────────────────────────────────────────
      if (count === 0) {
        this.state.noFaceTime += this.checkInterval;
        if (this.state.noFaceTime > this.thresholds.noFaceMax) {
          if (this.state.quizEndedByNoFace) return;
          this.state.quizEndedByNoFace = true;
          const alert = {
            eventType:   "no_face_detected",
            severity:    "high",
            description: `No face detected for > ${this.thresholds.noFaceMax / 1000} s.`,
            faceCount:   0,
          };
          this.state.malpracticeEvents.push({ type: "no_face_detected", timestamp: new Date().toISOString(), description: alert.description });
          this.stats.malpracticeDetected++;
          this._logEvent(alert).catch(() => {});
          console.warn("[Proctor] No face detected for > 12s. Triggering termination.");
          this.emit("malpractice_detected", { alerts: [alert] });
          this.emit("no_face_quiz_end", {
            message: `Auto-submission: No face detected for more than ${this.thresholds.noFaceMax / 1000} seconds.`,
          });
          this.stopMonitoring();
        }
      } else {
        this.state.noFaceTime = 0;
      }

      // Periodic frame capture
      const now = Date.now();
      if (now - this.lastFrameCapture > this.captureFrameInterval) {
        this.lastFrameCapture = now;
        this._captureFrame();
      }
    } catch (err) {
      console.error("[Proctor] Detection loop error:", err);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MULTIPLE FACES — IMMEDIATE TERMINATION
  // ═══════════════════════════════════════════════════════════════════════

  _handleMultipleFaces(count) {
    if (this.state.quizEndedByMultipleFaces) return;   // fire only once
    this.state.quizEndedByMultipleFaces = true;
    this.stats.multipleFacesEvents++;
    this.stats.malpracticeDetected++;

    console.warn(`[Proctor] 🚨 ${count} faces detected — ending quiz`);

    const alert = {
      eventType:   "multiple_faces",
      severity:    "high",
      description: `${count} faces detected simultaneously — unauthorized person in frame.`,
      faceCount:   count,
    };
    this.state.malpracticeEvents.push({ type: "multiple_faces", timestamp: new Date().toISOString(), faceCount: count });
    this._logEvent(alert).catch(() => {});
    this.emit("malpractice_detected", { alerts: [alert] });

    // Emit quiz-end signal FIRST, then stop (upload happens in background)
    this.emit("multiple_faces_quiz_end", {
      count,
      message: `🚨 ${count} faces detected. Quiz auto-submitted due to malpractice.`,
    });

    this.stopMonitoring(); // non-blocking; upload runs in background
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BACKEND LOGGING
  // ═══════════════════════════════════════════════════════════════════════

  async _logEvent(event) {
    try {
      let frameData = null;
      if (event.severity === "high" && this.canvasElement && this.videoElement) {
        // Draw current video frame to canvas, then capture as JPEG
        const ctx = this.canvasElement.getContext("2d");
        if (ctx && this.videoElement.readyState >= 2) {
          ctx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
          frameData = this.canvasElement.toDataURL("image/jpeg", 0.5).split(",")[1];
          ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        }
      }

      await fetch(`${this.apiBaseUrl}/log-event`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId:         this.quizId,
          contestantId:   this.contestantId,
          contestantName: this.contestantName,
          eventType:      event.eventType,
          severity:       event.severity,
          description:    event.description,
          faceCount:      event.faceCount,
          frameData,
        }),
      });
    } catch (err) {
      console.warn("[Proctor] logEvent failed:", err.message);
    }
  }

  _captureFrame() {
    if (!this.canvasElement || !this.videoElement || this.videoElement.readyState < 2) return;
    try {
      const ctx = this.canvasElement.getContext("2d");
      ctx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
      const fd = this.canvasElement.toDataURL("image/jpeg", 0.6).split(",")[1];
      ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      this.emit("frame_captured", { frameData: fd });
    } catch (_) {}
  }

  getStats() { return { ...this.stats, monitoring: this.monitoring }; }
}

// Export
if (typeof module !== "undefined" && module.exports) {
  module.exports = ProctorMonitor;
} else if (typeof window !== "undefined") {
  window.ProctorMonitor = ProctorMonitor;
}
