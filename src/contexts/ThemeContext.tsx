import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { settingsStore as settingsStorage } from "@/lib/localStorage";

type Theme = "light" | "dark";

export const ACCENT_COLORS: Record<string, { hsl: string; ring: string; label: string }> = {
  pink:   { hsl: "340 65% 55%", ring: "340 65% 55%", label: "Rose Eden" },
  violet: { hsl: "270 70% 60%", ring: "270 70% 60%", label: "Violet" },
  blue:   { hsl: "215 80% 55%", ring: "215 80% 55%", label: "Bleu" },
  green:  { hsl: "145 55% 42%", ring: "145 55% 42%", label: "Vert" },
  orange: { hsl: "22 90% 55%",  ring: "22 90% 55%",  label: "Orange" },
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  accent: keyof typeof ACCENT_COLORS;
  setAccent: (a: keyof typeof ACCENT_COLORS) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const initial = settingsStorage.get();
  const [theme, setThemeState] = useState<Theme>(initial.theme || "light");
  const [accent, setAccentState] = useState<keyof typeof ACCENT_COLORS>(initial.accent || "pink");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const c = ACCENT_COLORS[accent] ?? ACCENT_COLORS.pink;
    const root = document.documentElement;
    root.style.setProperty("--primary", c.hsl);
    root.style.setProperty("--ring", c.ring);
    root.style.setProperty("--sidebar-ring", c.ring);
  }, [accent]);

  const setTheme = (t: Theme) => { setThemeState(t); settingsStorage.update({ theme: t }); };
  const setAccent = (a: keyof typeof ACCENT_COLORS) => { setAccentState(a); settingsStorage.update({ accent: a }); };
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
