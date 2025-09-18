import { useCallback } from "react";
import useUpdateStateContext from "./useUpdateStateContext";
import useDetectLanguage from "./useDetectLanguage";
import useGetTranslation from "./useGetTranslation";

export function useTranslate() {
  const {
    setOutput,
    setUpdateDetectLanguage,
    sourceLanguage,
    targetLanguage,
    input,
  } = useUpdateStateContext();

  const detectLanguage = useDetectLanguage();
  const getTranslation = useGetTranslation();

  const translate = useCallback(
    async (input: string, source: string, target: string) => {
      if (!input) {
        setOutput("");
        return;
      }

      setOutput("Traduciendo...");

      if (source === "auto") {
        const detectedLanguage = await detectLanguage(input);
        updateDetectedLanguage(detectedLanguage);
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

  function updateDetectedLanguage(lang: string): void {
    setUpdateDetectLanguage(lang);
  }

  return translate;
}
