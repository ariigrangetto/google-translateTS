import { useRef } from "react";
import useDetectLanguage from "./useDetectLanguage.ts";
import useUpdateStateContext from "./useUpdateStateContext.ts";

interface TranslatorMonitor extends EventTarget {
  addEventListener(
    type: "downloadprogress",
    listener: (event: Event) => void
  ): void;
}

interface TranslatorResult {
  translate: (text: string) => Promise<string>;
}

interface TranslatorOptions {
  sourceLanguage: string;
  targetLanguage: string;
  monitor?: (monitor: TranslatorMonitor) => void;
}

interface Translator {
  create: (options: TranslatorOptions) => Promise<TranslatorResult>;
  availability: (options: {
    sourceLanguage: string;
    targetLanguage: string;
  }) => Promise<"available" | "unavailable">;
}

declare global {
  interface Window {
    Translator: Translator;
  }
}

export default function useGetTranslation() {
  const { setOutput } = useUpdateStateContext();
  const detectLanguage = useDetectLanguage();
  const currentTranslatorKey = useRef<string | null>(null);
  const currentTranslator = useRef<TranslatorResult | null>(null);

  async function getTranslation(text: string, source: string, target: string) {
    const sourceLanguageDetect =
      source === "auto" ? await detectLanguage(text) : source;

    if (sourceLanguageDetect === target) return text;

    try {
      const status = await window.Translator.availability({
        sourceLanguage: sourceLanguageDetect,
        targetLanguage: target,
      });

      if (status === "unavailable") {
        throw new Error(
          `Traducción de ${sourceLanguageDetect} a ${target} no disponible`
        );
      }
    } catch (error) {
      console.error(error);
      throw new Error(
        `Traducción de ${sourceLanguageDetect} a ${target} no disponible`
      );
    }

    const translatorKey = `${sourceLanguageDetect} - ${target}`;
    console.log(translatorKey);
    try {
      if (
        !currentTranslator.current ||
        currentTranslatorKey.current !== translatorKey
      ) {
        currentTranslator.current = await window.Translator.create({
          sourceLanguage: sourceLanguageDetect,
          targetLanguage: target,

          monitor: (monitor) => {
            monitor.addEventListener("downloadprogress", () => {
              console.log("descargando...");
              setOutput(`Descargando el modelo`);
            });
          },
        });
      }

      currentTranslatorKey.current = translatorKey;

      const translation = await currentTranslator.current.translate(text);
      return translation;
    } catch (e) {
      console.error(e);
      return "Error al traducir";
    }
  }

  return getTranslation;
}
