import { useCallback, useEffect, useState } from "react";
import type { AppSettings } from "@/types";

const STORAGE_KEY = "rats.settings";

const defaultSettings: AppSettings = {
  theme: "dark",
  environment: "development",
  postmanEnvironment: "Local Dev",
  github: {
    repository: "devtejasx/rest-api-testing-suite",
    workflow: "api-tests.yml",
    token: "ghp_••••••••••••••••••••",
  },
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return defaultSettings;
  }
}

/**
 * Persisted application settings (localStorage-backed). Also keeps the `dark`
 * class on <html> in sync with the selected theme.
 */
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    const root = document.documentElement;
    root.classList.toggle("dark", settings.theme === "dark");
  }, [settings]);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateGithub = useCallback((patch: Partial<AppSettings["github"]>) => {
    setSettings((prev) => ({ ...prev, github: { ...prev.github, ...patch } }));
  }, []);

  return { settings, update, updateGithub };
}
