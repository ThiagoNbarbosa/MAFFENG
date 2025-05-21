import { useTheme as useNextTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useTheme() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useNextTheme()
  
  // Efeito para garantir renderização do lado do cliente
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const toggleTheme = () => {
    const currentTheme = resolvedTheme || theme
    setTheme(currentTheme === "dark" ? "light" : "dark")
  }

  // Durante a montagem do componente, usamos valores padrão
  if (!mounted) {
    return {
      theme: "light",
      setTheme: () => {},
      toggleTheme: () => {},
      isDark: false
    }
  }

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === "dark" || theme === "dark"
  }
}