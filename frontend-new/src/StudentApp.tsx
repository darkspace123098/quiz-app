import { useState, useEffect, useRef } from "react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { toast } from "sonner"
import { StartScreen } from "./screens/StartScreen"
import { LoadingScreen } from "./screens/LoadingScreen"
import { QuizScreen } from "./screens/QuizScreen"
import type { Question } from "./screens/QuizScreen"
import { ResultScreen } from "./screens/ResultScreen"
import type { ResultData } from "./screens/ResultScreen"
import { apiFetch } from "@/lib/api"

type Screen = "start" | "loading" | "analyzing" | "quiz" | "result"

export default function StudentApp() {
  const [screen, setScreen] = useState<Screen>("start")
  const [studentUSN, setStudentUSN] = useState("")
  const [studentName, setStudentName] = useState("")
  const [quizCode, setQuizCode] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [quizTime, setQuizTime] = useState(300)
  const [resultData, setResultData] = useState<ResultData | null>(null)

  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const violationCount = useRef(0)
  const answersRef = useRef<Record<string, string>>({})

  // ─── Quiz Flow ─────────────────────────────────────────────────────────────

  const handleStartQuiz = async (usnInput: string, quizCodeInput: string, password: string) => {
    const usn = usnInput.trim().toUpperCase()
    setStudentUSN(usn)
    setScreen("loading")

    try {
      const params = new URLSearchParams({ usn, quizCode: quizCodeInput, password })
      const url = `/api/quiz/random?${params.toString()}`
      
      const res  = await apiFetch(url)
      
      if (!res.ok) {
        let errorMsg = `Failed to load quiz (Status: ${res.status})`;
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (_) {
          const text = await res.text().catch(() => "");
          if (text) console.error("[App] Server error text:", text);
        }
        toast.error(errorMsg)
        setScreen("start")
        return
      }

      const data = await res.json()
      setQuestions(data.questions)
      setStudentName(data.name)
      setQuizCode(data.quizCode || quizCodeInput)
      setQuizTime(data.quizTime || 300)
      setAnswers({})
      answersRef.current = {}
      setQuizSubmitted(false)
      violationCount.current = 0

      try { document.documentElement.requestFullscreen() } catch (_) {}
      setScreen("quiz")
    } catch (err) {
      console.error(err)
      toast.error("Failed to load quiz. Please try again.")
      setScreen("start")
    }
  }

  const submitQuizWithData = async (
    usn: string,
    name: string,
    currentAnswers: Record<string, string>
  ) => {
    if (quizSubmitted) return
    setQuizSubmitted(true)
    setScreen("loading")

    try {
      const url = "/api/quiz"
      const requestBody = { name, usn, responses: currentAnswers }

      const res  = await apiFetch(url, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(requestBody),
      })

      let data;
      try {
        data = await res.json();
      } catch (e) {
        console.error("[Quiz] Failed to parse response as JSON", e);
      }

      if (!res.ok) {
        const errorMsg = data?.message || data?.error || `Submission failed (Status: ${res.status})`;
        toast.error(errorMsg)
        setScreen("quiz")
        setQuizSubmitted(false)
        return
      }

      if (data.error) {
        toast.error(data.error)
        setScreen("quiz")
        setQuizSubmitted(false)
        return
      }

      setResultData(data)
      setScreen("result")
      toast.success("Quiz submitted successfully!")
    } catch (err) {
      console.error("[Quiz] Submission error:", err)
      toast.error(`Submission error: ${err instanceof Error ? err.message : "Unknown error"}`)
      setScreen("quiz")
      setQuizSubmitted(false)
    }
  }

  const handleForcedEnd = (reason: string, lastQId?: string, lastAnswer?: string) => {
    toast.error(`🚨 Quiz auto-submitted: ${reason}`, { duration: 6000 })
    
    let finalAnswers = answersRef.current
    if (lastQId && lastAnswer) {
      finalAnswers = { ...finalAnswers, [lastQId]: lastAnswer }
      answersRef.current = finalAnswers
      setAnswers(finalAnswers)
    }
    
    submitQuizWithData(studentUSN, studentName, finalAnswers)
  }

  const handleNextQuestion = (questionId: string, answer: string, isLast: boolean) => {
    const next = { ...answersRef.current, [questionId]: answer }
    answersRef.current = next
    setAnswers(next)
    
    if (isLast) {
      submitQuizWithData(studentUSN, studentName, next)
    }
  }

  const handleViolation = (message: string) => {
    violationCount.current += 1
    if (violationCount.current === 1) {
      toast.warning(
        `${message} This is your warning. Next violation will end the quiz.`,
        { duration: 5000 }
      )
      try { document.documentElement.requestFullscreen() } catch (_) {}
      return
    }
    if (violationCount.current > 1) {
      toast.error(`${message} Ending quiz...`, { duration: 3000 })
      setTimeout(() => submitQuizWithData(studentUSN, studentName, answersRef.current), 1500)
    }
  }

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && screen === "quiz" && !quizSubmitted) {
        handleViolation("Tab switch detected.")
      }
    }
    const handleBlur = () => {
      if (screen === "quiz" && !quizSubmitted) {
        handleViolation("Browser lost focus.")
      }
    }

    const handleKeydown = (e: KeyboardEvent) => {
      if (screen !== "quiz" || quizSubmitted) return
      const blocked =
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.key === "s") ||
        (e.ctrlKey && e.key === "p")

      if (blocked) {
        e.preventDefault()
        handleViolation("Suspicious keyboard shortcut detected.")
      }
    }

    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("blur", handleBlur)
    document.addEventListener("keydown", handleKeydown)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("blur", handleBlur)
      document.removeEventListener("keydown", handleKeydown)
    }
  }, [screen, quizSubmitted])

  return (
    <div className="min-h-screen w-full font-sans text-slate-900 dark:text-slate-50 relative selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="fixed top-2 sm:top-4 left-2 sm:left-auto sm:right-4 z-50">
        <ThemeToggle />
      </div>

      {screen === "start"   && <StartScreen onStart={handleStartQuiz} />}
      {screen === "loading" && <LoadingScreen />}
      {screen === "quiz"    && (
        <QuizScreen
          questions={questions}
          studentName={studentName}
          studentUSN={studentUSN}
          quizCode={quizCode}
          initialTimeLeft={quizTime}
          onTimeUp={(qId, ans) => {
            let final = answersRef.current
            if (qId && ans) {
              final = { ...final, [qId]: ans }
              answersRef.current = final
              setAnswers(final)
            }
            submitQuizWithData(studentUSN, studentName, final)
          }}
          onNextQuestion={handleNextQuestion}
          onForcedEnd={handleForcedEnd}
        />
      )}
      {screen === "result" && (
        <ResultScreen data={resultData} onRestart={() => window.location.reload()} />
      )}
    </div>
  )
}
