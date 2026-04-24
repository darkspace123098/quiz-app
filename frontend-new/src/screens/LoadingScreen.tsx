import { Loader2 } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
        <Loader2 className="h-10 sm:h-12 w-10 sm:w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 animate-pulse text-center">
          Loading quiz data...
        </p>
      </div>
    </div>
  )
}
