"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
  mounted: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Determine initial theme: default to light as requested
    let initialTheme: Theme = "light";
    try {
      const stored = localStorage.getItem("unifolio-theme") as Theme | null;
      if (stored === "light" || stored === "dark") {
        initialTheme = stored;
      }
    } catch {
      // Ignore in private browsing
    }

    setThemeState(initialTheme);
    applyThemeClass(initialTheme);
    setMounted(true);
  }, []);

  const applyThemeClass = (t: Theme) => {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    window.dispatchEvent(new CustomEvent("unifolio-theme-change", { detail: { theme: t } }));
  };

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyThemeClass(newTheme);
    try {
      localStorage.setItem("unifolio-theme", newTheme);
    } catch {
      // Ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
