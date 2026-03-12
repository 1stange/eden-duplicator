import { useState } from "react";
import { settings as settingsStorage } from "@/lib/localStorage";
import { useTheme } from "@/contexts/ThemeContext";
import { Settings as SettingsIcon, Bell, Globe, Palette, Moon, Sun, RotateCcw } from "lucide-react";

export default function Settings() {
  const [appSettings, setAppSettings] = useState(settingsStorage.get());
  const { theme, toggleTheme } = useTheme();

  const updateSetting = (key: string, value: unknown) => {
    const updated = settingsStorage.update({ [key]: value });
    setAppSettings(updated);
  };

  const resetSettings = () => {
    const defaults = settingsStorage.reset();
    setAppSettings(defaults);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="eden-section-title mb-6 flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-primary" /> Paramètres
      </h1>

      <div className="eden-card p-4 mb-4">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" /> Préférences
        </h2>
        <div className="space-y-4">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-accent" />}
              <div>
                <p className="text-sm font-medium text-foreground">Mode sombre</p>
                <p className="text-xs text-muted-foreground">{theme === "dark" ? "Activé" : "Désactivé"}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-11 h-6 rounded-full transition-colors relative ${theme === "dark" ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-md transition-transform ${theme === "dark" ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">Recevoir les notifications</p>
            </div>
            <button
              onClick={() => updateSetting("notifications", !appSettings.notifications)}
              className={`w-11 h-6 rounded-full transition-colors relative ${appSettings.notifications ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-md transition-transform ${appSettings.notifications ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Globe className="h-3 w-3" /> Langue
            </label>
            <select value={appSettings.language} onChange={(e) => updateSetting("language", e.target.value)} className="eden-input">
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Palette className="h-3 w-3" /> Devise
            </label>
            <select value={appSettings.currency} onChange={(e) => updateSetting("currency", e.target.value)} className="eden-input">
              <option value="FCFA">FCFA</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
      </div>

      <button onClick={resetSettings} className="text-sm text-destructive hover:underline flex items-center gap-1">
        <RotateCcw className="h-4 w-4" /> Réinitialiser les paramètres
      </button>
    </div>
  );
}
