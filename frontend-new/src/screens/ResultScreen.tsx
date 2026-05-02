import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, AlertCircle, Download } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export interface ResultData {
  status: string
  message?: string
  name: string
  score: number
  totalQuestions: number
  correctAnswers: {
    questionText: string
    correctAnswer: string
    userAnswer: string
  }[]
}

interface ResultScreenProps {
  data: ResultData | null
  onRestart: () => void
}

export function ResultScreen({ data, onRestart }: ResultScreenProps) {
  if (!data || data.status === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-2 sm:p-4">
        <Card className="w-full max-w-xs sm:max-w-md bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/50 dark:to-rose-900/50 border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2 text-lg sm:text-xl">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" /> Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm sm:text-base text-red-600 dark:text-red-300">
            {data?.message || "Unable to retrieve results. Please contact administrator."}
          </CardContent>
          <div className="p-4 sm:p-6 pt-0">
            <Button onClick={onRestart} className="w-full bg-red-600 hover:bg-red-700 text-sm sm:text-base py-2 sm:py-2.5">Go Back</Button>
          </div>
        </Card>
      </div>
    )
  }

  const percentage = data.totalQuestions > 0 ? Math.round((data.score / data.totalQuestions) * 100) : 0
  const correctCount = data.correctAnswers.filter((q) => q.userAnswer === q.correctAnswer).length
  const incorrectCount = data.correctAnswers.filter((q) => q.userAnswer && q.userAnswer !== q.correctAnswer).length
  const unansweredCount = data.correctAnswers.filter((q) => !q.userAnswer || q.userAnswer === "Not answered").length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-2 sm:p-4 py-8 sm:py-12 flex justify-center w-full">
      <div className="w-full max-w-xs sm:max-w-2xl lg:max-w-4xl space-y-4 sm:space-y-6 animate-in slide-in-from-bottom-8 duration-500">
        <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-2xl">
          <CardHeader className="text-center pb-2 px-3 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold opacity-90 break-words">
              Congratulations,<br className="sm:hidden" /> {data.name}!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center px-3 sm:px-6">
            <div className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter my-4 sm:my-6 drop-shadow-md">
              {data.score}
              <span className="text-2xl sm:text-3xl lg:text-4xl text-indigo-200 ml-1">/{data.totalQuestions}</span>
            </div>
            <p className="text-base sm:text-lg lg:text-xl font-medium text-indigo-100">Score: {percentage}%</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50 text-center py-3 sm:py-6 shadow-sm px-1 sm:px-4">
            <div className="text-2xl sm:text-4xl font-bold text-green-600 dark:text-green-500">{correctCount}</div>
            <div className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-400 mt-1 uppercase tracking-wider">Correct</div>
          </Card>
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/50 text-center py-3 sm:py-6 shadow-sm px-1 sm:px-4">
            <div className="text-2xl sm:text-4xl font-bold text-red-600 dark:text-red-500">{incorrectCount}</div>
            <div className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-400 mt-1 uppercase tracking-wider">Incorrect</div>
          </Card>
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50 text-center py-3 sm:py-6 shadow-sm px-1 sm:px-4">
            <div className="text-2xl sm:text-4xl font-bold text-amber-500 dark:text-amber-500">{unansweredCount}</div>
            <div className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-400 mt-1 uppercase tracking-wider">Unanswered</div>
          </Card>
        </div>

        <Card className="shadow-lg border-slate-200 dark:border-slate-800">
          <CardHeader className="px-3 sm:px-6">
            <CardTitle className="text-lg sm:text-xl text-slate-800 dark:text-slate-100">Detailed Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
            {data.correctAnswers.map((item, idx) => {
              const isCorrect = item.userAnswer === item.correctAnswer
              const isUnanswered = !item.userAnswer || item.userAnswer === "Not answered"

              return (
                <div
                  key={idx}
                  className={`p-3 sm:p-5 rounded-xl border-l-4 border transition-all hover:shadow-md ${
                    isCorrect
                      ? "border-l-green-500 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                      : isUnanswered
                      ? "border-l-amber-500 bg-amber-50/50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                      : "border-l-red-500 bg-red-50/50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 sm:mb-3 text-sm sm:text-lg leading-snug break-words">
                    <span className="text-slate-500 dark:text-slate-400 mr-1 sm:mr-2">{idx + 1}.</span>
                    {item.questionText}
                  </h5>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm font-medium">
                    <div className="flex items-start gap-1.5 sm:gap-2 text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/40 p-2 sm:p-2.5 rounded-lg break-words">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> 
                      <span>Correct: {item.correctAnswer}</span>
                    </div>
                    <div
                      className={`flex items-start gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-lg break-words ${
                        isCorrect
                          ? "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/40 hidden"
                          : isUnanswered
                          ? "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40"
                          : "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/40"
                      }`}
                    >
                      {isCorrect ? null : isUnanswered ? (
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      )}
                      <span>Your: {item.userAnswer || "Not answered"}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
          <div className="p-3 sm:p-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Button 
              onClick={() => {
                const doc = new jsPDF();
                doc.setFontSize(22);
                doc.text("Quiz Result Report", 105, 20, { align: "center" });
                
                doc.setFontSize(12);
                doc.text(`Student Name: ${data.name}`, 20, 40);
                doc.text(`Date: ${new Date().toLocaleString()}`, 20, 50);
                
                autoTable(doc, {
                  startY: 60,
                  head: [['Category', 'Details']],
                  body: [
                    ['Score', `${data.score} / ${data.totalQuestions}`],
                    ['Percentage', `${percentage}%`],
                    ['Correct Answers', correctCount],
                    ['Incorrect Answers', incorrectCount],
                    ['Unanswered', unansweredCount]
                  ],
                  theme: 'striped',
                  headStyles: { fillColor: [79, 70, 229] }
                });

                // Detailed question breakdown
                const tableBody = data.correctAnswers.map((item, index) => {
                  const status = item.userAnswer === item.correctAnswer ? "Correct" : (!item.userAnswer || item.userAnswer === "Not answered" ? "Unanswered" : "Incorrect");
                  return [
                    index + 1,
                    item.questionText.substring(0, 40) + (item.questionText.length > 40 ? "..." : ""),
                    item.correctAnswer,
                    item.userAnswer || "Not answered",
                    status
                  ];
                });

                autoTable(doc, {
                  startY: (doc as any).lastAutoTable.finalY + 15,
                  head: [['#', 'Question', 'Correct Answer', 'Your Answer', 'Status']],
                  body: tableBody,
                  theme: 'striped',
                  styles: { fontSize: 8 },
                  headStyles: { fillColor: [79, 70, 229] },
                  columnStyles: { 0: { cellWidth: 10 }, 4: { cellWidth: 25 } }
                });

                doc.save(`${data.name.replace(/\s+/g, '_')}_Result.pdf`);
              }}
              variant="outline"
              className="w-full text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-sm sm:text-base py-2 sm:py-2.5 font-semibold gap-2"
            >
              <Download size={18} />
              Download Result
            </Button>
            <Button 
              onClick={onRestart} 
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-sm sm:text-base py-2 sm:py-2.5 font-semibold"
            >
              Take Another Quiz
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
