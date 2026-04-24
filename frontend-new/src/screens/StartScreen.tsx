import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface StartScreenProps {
  onStart: (usn: string, quizCode: string, password: string) => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [usn, setUsn] = useState("")
  const [quizCode, setQuizCode] = useState("")
  const [password, setPassword] = useState("")
  const [agree, setAgree] = useState(false)

  const handleStart = () => {
    if (!usn || !quizCode || !password || !agree) {
      toast.warning("Missing Fields", {
        description: "Enter USN, quiz code, your contestant password, and agree to the rules.",
      })
      return
    }
    onStart(usn, quizCode, password)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 p-2 sm:p-4 w-full">
      <Card className="w-full max-w-xs sm:max-w-lg shadow-2xl border-none">
        <CardHeader className="text-center pb-2 px-3 sm:px-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Login to Start Quiz
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            Enter your verified credentials to proceed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
          <div className="bg-slate-100 dark:bg-slate-800 p-3 sm:p-4 rounded-xl text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2 border border-slate-200 dark:border-slate-700 max-h-40 sm:max-h-full overflow-y-auto">
            <h4 className="font-semibold text-slate-800 dark:text-slate-100">Rules and Regulations:</h4>
            <ul className="list-disc pl-4 sm:pl-5 space-y-1">
              <li>Each student can attempt the quiz only once.</li>
              <li>Total time for the quiz will be displayed when you start.</li>
              <li>Do not switch tabs or minimize the window—doing so will auto-submit the quiz.</li>
              <li>Select the best answer for each question before clicking "Next".</li>
              <li>Quiz will auto-submit once the timer ends.</li>
              <li><strong>Use only mouse</strong> (keyboard use is not allowed).</li>
              <li><strong>You cannot go back to the previous question once you click Next.</strong></li>
            </ul>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="agree" 
                checked={agree} 
                onCheckedChange={(val) => setAgree(!!val)} 
                className="flex-shrink-0"
              />
              <label
                htmlFor="agree"
                className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I agree to the rules
              </label>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="usn" className="text-xs sm:text-sm font-semibold">Your USN</Label>
              <Input
                id="usn"
                placeholder="e.g. 1RV20CS001"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                className="transition-all focus-visible:ring-indigo-500 text-sm"
              />
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="quizcode" className="text-xs sm:text-sm font-semibold">Quiz Code</Label>
              <Input
                id="quizcode"
                placeholder="Enter Quiz Code"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value)}
                className="transition-all focus-visible:ring-indigo-500 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <Label htmlFor="password" className="text-xs sm:text-sm font-semibold">Contestant Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password given by admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="transition-all focus-visible:ring-indigo-500 bg-white dark:bg-slate-900 text-sm"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This password is assigned by admin for this contestant only.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-3 sm:px-6 pb-4 sm:pb-6">
          <Button 
            onClick={handleStart} 
            className="w-full text-sm sm:text-base py-2.5 sm:py-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 font-semibold"
          >
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
