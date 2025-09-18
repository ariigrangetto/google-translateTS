export default function useCheckApiSupport() {
  const checkApiSupport = (): void => {
    const hasNativeTranslator = "Translator" in window;
    const hasNativeDetector = "LanguageDetector" in window;

    if (!hasNativeDetector || !hasNativeTranslator) {
      console.warn("Native API of traduction and detection NOT supported");
    } else {
      console.log("Available native API");
    }
  };
  return { checkApiSupport };
}
