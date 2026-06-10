import { useEffect, useState } from "react";

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  fontFamily: "serif" | "sans" | "noto";
  theme: "light" | "sepia" | "dark";
  maxWidth: number;
}

const DEFAULTS: ReaderSettings = {
  fontSize: 18,
  lineHeight: 1.8,
  fontFamily: "serif",
  theme: "light",
  maxWidth: 760,
};

const KEY = "reader-settings-v1";

export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  return [settings, setSettings] as const;
}

export const FONT_FAMILY_CLASS: Record<ReaderSettings["fontFamily"], string> = {
  serif: "font-serif",
  sans: "font-sans",
  noto: "[font-family:'Noto_Serif',serif]",
};

export const THEME_CLASS: Record<ReaderSettings["theme"], string> = {
  light: "bg-background text-foreground",
  sepia: "bg-[#f4ecd8] text-[#3a2f1c]",
  dark: "bg-[#1a1a1a] text-[#d4d4d4]",
};
