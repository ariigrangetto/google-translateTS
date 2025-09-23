import { useCallback } from "react";
import useUpdateStateContext from "./useUpdateStateContext.ts";
import useDetectLanguage from "./useDetectLanguage.ts";
import useGetTranslation from "./useGetTranslation.ts";
import type { LanguageKeys } from "../types.d";

export function useTranslate() {
  const {
    setOutput,
    setUpdateDetectLanguage,
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    input,
  } = useUpdateStateContext();

  const detectLanguage = useDetectLanguage();
  const getTranslation = useGetTranslation();

  const translate = useCallback(
    async (
      input: string,
      source: LanguageKeys | "auto",
      target: LanguageKeys
    ) => {
      if (!input) {
        setOutput("");
        return;
      }

      setOutput("Traduciendo...");

      if (source === "auto") {
        const detectedLanguage = (await detectLanguage(input)) as LanguageKeys;
        updateDetectedLanguage(detectedLanguage);
        setSourceLanguage(detectedLanguage);
      }

      try {
        const translation = await getTranslation(input, source, target);
        setOutput(translation);
      } catch (error) {
        console.error(error);
        setOutput("Error al traducir");
      }
    },
    [sourceLanguage, targetLanguage, input]
  );

  function updateDetectedLanguage(lang: LanguageKeys): void {
    setUpdateDetectLanguage(lang);
  }

  return translate;
}
