import useDetectLanguage from "./useDetectLanguage.ts";
import { useTranslate } from "./useTranslate.ts";
import useUpdateStateContext from "./useUpdateStateContext.ts";

export default function useSwapLanguages() {
  const {
    sourceLanguage,
    setSourceLanguage,
    input,
    targetLanguage,
    setInput,
    setOutput,
    output,
    setTargetLanguage,
  } = useUpdateStateContext();

  const detectLanguage = useDetectLanguage();
  const translate = useTranslate();

  async function swapLanguages(): Promise<void> {
    if (sourceLanguage === "auto") {
      const detectedLanguage = await detectLanguage(input);
      setSourceLanguage(detectedLanguage);
    }

    //magic of swap
    const temporalLanguage = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temporalLanguage);

    setInput(output);
    setOutput("");

    if (input) {
      translate(input, targetLanguage, sourceLanguage);
    }
  }

  return swapLanguages;
}
