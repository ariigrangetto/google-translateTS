import { useRef } from "react";
import { DEFAULT_SOURCE_LANGUAGE, SUPPORTED_LANGUAGES } from "../constants";

export default function useDetectLanguage() {
  const currentDetector = useRef<string | null>(null);

  async function detectLanguage(text: string): Promise<string> {
    try {
      if (!currentDetector.current) {
        currentDetector.current = await window.LanguageDetector.create({
          expectedLanguages: SUPPORTED_LANGUAGES,
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
