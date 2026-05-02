import { useMemo } from "react"
import { useTheme } from "@/components/ThemeProvider"

type ThemeAwareLogoProps = {
  alt?: string
  className?: string
}

export default function ThemeAwareLogo({
  alt = "IntelliQuiz Logo",
  className,
}: ThemeAwareLogoProps) {
  const { theme } = useTheme()

  const logoSrc = useMemo(() => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)

    return isDark ? "/logo-dark.png" : "/logo.png"
  }, [theme])

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={className}
      onError={(event) => {
        const img = event.currentTarget
        if (img.src.includes("logo-dark.png")) {
          img.src = "/logo.png"
        }
      }}
    />
  )
}
