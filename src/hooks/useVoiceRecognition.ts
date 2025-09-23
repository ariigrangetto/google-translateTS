import { useRef } from "react";
import useUpdateStateContext from "./useUpdateStateContext.ts";
import useLanguageCode from "./useLanguageCode.ts";
import useDetectLanguage from "./useDetectLanguage.ts";
import { useTranslate } from "./useTranslate.ts";
import type { LanguageKeys } from "../types.d";

export default function useVoiceRecognition() {
  const micButtonRef = useRef<HTMLButtonElement | null>(null);
  const detectLanguage = useDetectLanguage();
  const translate = useTranslate();
  const { sourceLanguage, setInput, targetLanguage, input } =
    useUpdateStateContext();
  const getFullLanguageCode = useLanguageCode();

  async function startVoiceRecognition(): Promise<void> {
    const hasNativeRecognitionSupport: boolean =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

    if (!hasNativeRecognitionSupport) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    let language: LanguageKeys;

    if (sourceLanguage === "auto") {
      language = (await detectLanguage(input)) as LanguageKeys;
    } else {
      language = sourceLanguage as LanguageKeys;
    }

    recognition.lang = getFullLanguageCode(language as LanguageKeys);

    recognition.onaudiostart = () => {
      console.log("working");
      if (micButtonRef.current) {
        micButtonRef.current.style.backgroundColor = "var(--google-red)";
        micButtonRef.current.style.color = "white";
      }
    };

    recognition.onaudioend = () => {
      if (micButtonRef.current) {
        micButtonRef.current.style.backgroundColor = "";
        micButtonRef.current.style.color = "";
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent): void => {
      const [{ transcript }] = event.results[0];
      setInput(transcript);
      translate(transcript, sourceLanguage as LanguageKeys, targetLanguage);
    };

    recognition.onnomatch = () => {
      console.error("Speech not recognized");
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent): void => {
      console.log("Error de reconocimiento de voz", event.error);
    };

    recognition.start();
  }

  return { startVoiceRecognition, micButtonRef };
}
