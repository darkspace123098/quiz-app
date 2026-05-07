import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="rounded-xl w-10 h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm opacity-0" />
    )
  }

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-xl w-10 h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 shadow-sm group relative"
      title={`Current theme: ${theme}. Click to cycle.`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Sun Icon */}
        <Sun className={`h-[1.2rem] w-[1.2rem] transition-all duration-500 absolute
          ${theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}
        `} />
        
        {/* Moon Icon */}
        <Moon className={`h-[1.2rem] w-[1.2rem] transition-all duration-500 absolute
          ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}
        `} />

        {/* System Icon */}
        <Laptop className={`h-[1.2rem] w-[1.2rem] transition-all duration-500 absolute
          ${theme === 'system' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}
        `} />
      </div>
      
      <span className="sr-only">Toggle theme</span>
      
      {/* Tooltip-like label on hover (optional, but premium) */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none capitalize whitespace-nowrap z-[100]">
        {theme}
      </div>
    </Button>
  )
}
