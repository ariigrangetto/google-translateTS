import { useRef } from "react";
import { DEFAULT_SOURCE_LANGUAGE, SUPPORTED_LANGUAGES } from "../constants.ts";

interface DetectorResult {
  detect: (text: string) => Promise<Array<{ detectedLanguage: string }>>;
}

export interface LanguageDetector {
  create: (options: { expectedLanguages: string[] }) => Promise<DetectorResult>;
}

declare global {
  interface Window {
    LanguageDetector: LanguageDetector;
  }
}

export default function useDetectLanguage() {
  const currentDetector = useRef<DetectorResult | null>(null);
  async function detectLanguage(text: string): Promise<string> {
    try {
      if (!currentDetector.current) {
        currentDetector.current = await window.LanguageDetector.create({
          expectedLanguages: [...SUPPORTED_LANGUAGES],
          //para evitar mutacion ya que ahora supported languages es de readonly al hacerle as const
        });
      }
      const results = await currentDetector.current.detect(text);

      const detectedLanguage = results[0]?.detectedLanguage;

      return detectedLanguage === "und"
        ? DEFAULT_SOURCE_LANGUAGE
        : detectedLanguage;
    } catch (error) {
      console.error(error);
      return DEFAULT_SOURCE_LANGUAGE;
    }
  }

  return detectLanguage;
}
