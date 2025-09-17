import { useCallback, useRef, useState } from "react";

interface UseTranslationProps {
  sourceLanguage: string;
  targetLanguage: string;
}

export default function useTranslation({
  sourceLanguage,
  targetLanguage,
}): UseTranslationProps {
  const [output, setOutput] = useState("");

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
    [sourceLanguage, targetLanguage]
  );

  return { output, translate };
}
