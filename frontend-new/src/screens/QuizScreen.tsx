import { useState, useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { getApiUrl } from "@/lib/api"

export interface Question {
  _id: string
  questionText: string
  options: string[]
}

interface QuizScreenProps {
  questions: Question[]
  studentName: string
  studentUSN?: string
  quizCode?: string
  initialTimeLeft: number
  onTimeUp: (lastQId?: string, lastAnswer?: string) => void
  onNextQuestion: (questionId: string, answer: string, isLast: boolean) => void
  onForcedEnd?: (reason: string, lastQId?: string, lastAnswer?: string) => void
}

export function QuizScreen({
  questions,
  studentName,
  studentUSN = "unknown",
  quizCode   = "unknown",
  initialTimeLeft,
  onTimeUp,
  onNextQuestion,
  onForcedEnd,
}: QuizScreenProps) {
  const [currentIndex, setCurrentIndex]     = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [timeLeft, setTimeLeft]             = useState(initialTimeLeft)
  const [faceCount, setFaceCount]           = useState<number | null>(null)
  const [isRecording, setIsRecording]       = useState(false)
  const [violationFlash, setViolationFlash] = useState(false)
  const [isSubmitting, setIsSubmitting]     = useState(false)

  // ONE video element — visible in the preview widget — also used by ProctorMonitor
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const proctor   = useRef<any>(null)
  const inited    = useRef(false)

  // Use refs to avoid stale closures in proctor callbacks
  const indexRef = useRef(currentIndex)
  const answerRef = useRef(selectedAnswer)

  useEffect(() => { indexRef.current = currentIndex }, [currentIndex])
  useEffect(() => { answerRef.current = selectedAnswer }, [selectedAnswer])

  // ── Stop proctor + wait for upload, then call callback ─────────────────
  const stopAndCallback = async (cb: () => void, waitForUpload = true) => {
    try {
      if (proctor.current?.monitoring) {
        const stopPromise = proctor.current.stopMonitoring()
        if (waitForUpload) {
          await stopPromise
          // also wait explicitly in case onstop fires async
          await proctor.current.waitForUpload?.()
        }
      }
    } catch (e) {
      console.warn("[Quiz] stopMonitoring error:", e)
    }
    cb()
  }

  // ── Init proctoring ────────────────────────────────────────────────────
  useEffect(() => {
    if (inited.current) return
    inited.current = true

    const init = async () => {
      try {
        if (!window.ProctorMonitor) {
          toast.warning("Face detection script not found", { duration: 3000 })
          return
        }
        if (!videoRef.current || !canvasRef.current) {
          throw new Error("Video / canvas element not mounted")
        }

        proctor.current = new window.ProctorMonitor({
          videoElement:        videoRef.current,
          canvasElement:       canvasRef.current,
          quizId:              quizCode,
          contestantId:        studentUSN,
          contestantName:      studentName,
          apiBaseUrl:          getApiUrl("/api/proctor"),
          checkInterval:       1500,
          captureFrameInterval: 5000,
        })


        proctor.current.on("error",             (d: any) => { if (!d.isCritical) toast.warning(d.message, { duration: 4000 }) })
        proctor.current.on("initialized",       ()       => toast.success("🔒 Face detection activated", { duration: 2000 }))
        proctor.current.on("recording_started", ()       => setIsRecording(true))
        proctor.current.on("started",           ()       => toast.info("📹 Camera monitoring active — recording", { duration: 3000 }))
        proctor.current.on("stopped",           ()       => setIsRecording(false))

        proctor.current.on("face_count_update", (d: any) => setFaceCount(d.count))
        proctor.current.on("face_detected",     ()       => setFaceCount(prev => (prev === null || prev < 1) ? 1 : prev))

        proctor.current.on("recording_uploaded", (d: any) =>
          toast.success(`✅ Recording saved (${d.sizeMB ?? "?"} MB)`, { duration: 3000 })
        )

        proctor.current.on("recording_upload_failed", (d: any) =>
          toast.error(`Recording upload failed: ${d.error}`, { duration: 5000 })
        )

        // ── 🚨 Multiple faces → immediate forced quiz end ──────────────
        proctor.current.on("multiple_faces_quiz_end", (d: any) => {
          setViolationFlash(true)
          toast.error(`🚨 ${d.message}`, { duration: 6000 })
          stopAndCallback(() => {
            const currentQId = questions[indexRef.current]?._id
            if (onForcedEnd) onForcedEnd(d.message || "Multiple faces detected", currentQId, answerRef.current)
            else onTimeUp()
          }, false)
        })

        proctor.current.on("no_face_quiz_end", (d: any) => {
          setViolationFlash(true)
          toast.error(`🚨 ${d.message}`, { duration: 6000 })
          stopAndCallback(() => {
            const currentQId = questions[indexRef.current]?._id
            if (onForcedEnd) onForcedEnd(d.message || "No face detected for too long", currentQId, answerRef.current)
            else onTimeUp()
          }, false)
        })

        proctor.current.on("malpractice_detected", (d: any) => {
          const alerts: any[] = d.alerts || []
          for (const a of alerts) {
            if (a.eventType === "multiple_faces") continue   // handled above
            if (a.eventType === "no_face_detected") {
              toast.warning(`⚠️ ${a.description}`, { duration: 4000 })
            }
          }
        })

        await proctor.current.startMonitoring()
      } catch (err) {
        console.error("[Quiz] Proctor init error:", err)
        toast.error(`Proctoring error: ${err instanceof Error ? err.message : "Unknown"}`, { duration: 4000 })
      }
    }

    init()

    return () => {
      // On unmount just stop (upload may already be done or running)
      proctor.current?.stopMonitoring?.()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Countdown timer ────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t)
          const qId = questions[indexRef.current]?._id
          const ans = answerRef.current
          stopAndCallback(() => onTimeUp(qId, ans))
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [onTimeUp]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Violation flash reset ──────────────────────────────────────────────
  useEffect(() => {
    if (!violationFlash) return
    const t = setTimeout(() => setViolationFlash(false), 3000)
    return () => clearTimeout(t)
  }, [violationFlash])

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  const handleNext = async () => {
    const isLast = currentIndex === questions.length - 1
    const qId    = questions[currentIndex]._id

    if (isSubmitting) return
    setIsSubmitting(true)

    if (isLast) {
      try {
        // Stop proctoring and WAIT for upload before signalling quiz end
        await stopAndCallback(() => onNextQuestion(qId, selectedAnswer, true))
      } catch (err) {
        console.error("[Quiz] Final submission error:", err)
        setIsSubmitting(false)
      }
    } else {
      onNextQuestion(qId, selectedAnswer, false)
      setCurrentIndex(p => p + 1)
      setSelectedAnswer("")
      setIsSubmitting(false)
    }
  }

  if (!questions || questions.length === 0) return null
  const q = questions[currentIndex]

  const badgeColor =
    faceCount === null  ? "bg-slate-500" :
    faceCount === 0     ? "bg-yellow-500" :
    faceCount === 1     ? "bg-green-500"  :
                          "bg-red-600 animate-pulse"

  const badgeLabel =
    faceCount === null  ? "Scanning…" :
    faceCount === 0     ? "No Face"   :
    faceCount === 1     ? "1 Face ✓"  :
                          `🚨 ${faceCount} Faces!`

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-2 sm:p-4 relative w-full">

      {/* Red violation flash overlay */}
      {violationFlash && (
        <div className="fixed inset-0 z-50 pointer-events-none"
             style={{ background: "rgba(239,68,68,0.18)", border: "4px solid #ef4444", animation: "flashRed 0.4s ease 4" }} />
      )}

      {/* ── Camera preview (top-right) ──────────────────────────────────── */}
      <div
        id="proctor-camera-preview"
        className="fixed top-2 sm:top-4 right-2 sm:right-4 z-40 bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden transition-all"
        style={{
          width:       "clamp(120px, 18vw, 220px)",
          height:      "clamp(90px, 14vw, 165px)",
          border:      `2px solid ${faceCount !== null && faceCount >= 2 ? "#ef4444" : "#6366f1"}`,
          boxShadow:   faceCount !== null && faceCount >= 2
            ? "0 0 0 3px #ef4444, 0 8px 24px rgba(239,68,68,0.4)"
            : "0 8px 24px rgba(99,102,241,0.3)",
        }}
      >
        <div className="relative w-full h-full bg-black">

          {/*
            SINGLE <video> element.
            ProctorMonitor attaches the camera stream here via videoRef.
            This same element is visible as the preview.
          */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />

          {/* Hidden canvas for face detection snapshots */}
          <canvas ref={canvasRef} className="hidden" style={{ display: "none" }} />

          {/* REC indicator */}
          {isRecording && (
            <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
              <span className="text-white text-[10px] font-bold">REC</span>
            </div>
          )}

          {/* Face count badge */}
          <div className={`absolute bottom-1.5 left-1.5 text-white px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${badgeColor}`}>
            {badgeLabel}
          </div>

          {/* Proctor label */}
          <div className="absolute top-1.5 right-1.5 bg-indigo-600/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px] font-semibold">
            Proctor
          </div>

          {/* Multiple-face warning */}
          {faceCount !== null && faceCount >= 2 && (
            <div className="absolute inset-x-0 bottom-7 flex justify-center">
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-bounce">
                ⛔ MULTIPLE FACES
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Quiz card ──────────────────────────────────────────────────── */}
      <Card className="w-full max-w-sm sm:max-w-2xl lg:max-w-3xl shadow-xl border-slate-200 dark:border-slate-800 mt-28 sm:mt-0">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4 sm:gap-0">
          <div className="min-w-0">
            <CardTitle className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">
              Q{currentIndex + 1} / {questions.length}
            </CardTitle>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 truncate">{studentName}</p>
          </div>
          <div className={`font-mono font-bold px-3 py-2 rounded-lg border shadow-sm text-lg sm:text-xl whitespace-nowrap flex-shrink-0 transition-colors ${
            timeLeft <= 30
              ? "bg-red-50 dark:bg-red-950/30 text-red-600 border-red-200 animate-pulse"
              : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          }`}>
            ⏱ {fmt(timeLeft)}
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6 px-3 sm:px-6">
          <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 leading-relaxed break-words">
            {q.questionText}
          </h3>

          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-3">
            {q.options.map((opt, idx) => (
              <Label
                key={idx}
                htmlFor={`option-${idx}`}
                className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer min-h-12 ${
                  selectedAnswer === opt
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500"
                    : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <RadioGroupItem value={opt} id={`option-${idx}`} className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm sm:text-base break-words">{opt}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>

        <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end px-3 sm:px-6 pb-4">
          <Button
            onClick={handleNext}
            size="lg"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : currentIndex === questions.length - 1 ? (
              "Submit Quiz ✓"
            ) : (
              "Next →"
            )}
          </Button>
        </CardFooter>
      </Card>

      <style>{`
        @keyframes flashRed { 0%,100%{opacity:0} 50%{opacity:1} }
      `}</style>
    </div>
  )
}
