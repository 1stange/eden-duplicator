import { useTheme } from "@/contexts/ThemeContext";
import { Settings as SettingsIcon, Moon, Sun, RotateCcw } from "lucide-react";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="eden-section-title mb-6 flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-primary" /> Paramètres
      </h1>
      <div className="eden-card p-4 mb-4">
        <h2 className="font-semibold text-foreground mb-4">Préférences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-accent" />}
              <div>
                <p className="text-sm font-medium text-foreground">Mode sombre</p>
                <p className="text-xs text-muted-foreground">{theme === "dark" ? "Activé" : "Désactivé"}</p>
              </div>
            </div>
            <button onClick={toggleTheme} className={`w-11 h-6 rounded-full transition-colors relative ${theme === "dark" ? "bg-primary" : "bg-muted"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-md transition-transform ${theme === "dark" ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
