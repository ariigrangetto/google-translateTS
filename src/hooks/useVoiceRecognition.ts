import { useRef } from "react";
import useUpdateStateContext from "./useUpdateStateContext";
import useLanguageCode from "./useLanguageCode";
import useDetectLanguage from "./useDetectLanguage";
import { useTranslate } from "./useTranslate";

export default function useVoiceRecognition() {
  const micButtonRef = useRef(null);
  const detectLanguage = useDetectLanguage();
  const translate = useTranslate();
  const { sourceLanguage, setInput, targetLanguage, input } =
    useUpdateStateContext();
  const getFullLanguageCode = useLanguageCode();

  async function startVoiceRecognition() {
    const hasNativeRecognitionSupport =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

    if (!hasNativeRecognitionSupport) return;

    const recognition: SpeechRecognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();

    recognition.continuous = false;
    recognition.interimResults = false;

    const language =
      sourceLanguage === "auto" ? await detectLanguage(input) : sourceLanguage;

    recognition.lang = getFullLanguageCode(language);

    recognition.onaudiostart = () => {
      console.log("working");
      micButtonRef.current.style.backgroundColor = "var(--google-red)";
      micButtonRef.current.style.color = "white";
    };

    recognition.onaudioend = () => {
      micButtonRef.current.style.backgroundColor = "";
      micButtonRef.current.style.color = "";
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const [{ transcript }] = event.results[0];
      setInput(transcript);
      translate(transcript, sourceLanguage, targetLanguage);
    };

    recognition.onnomatch = () => {
      console.error("Speech not recognized");
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log("Error de reconocimiento de voz", event.error);
    };

    recognition.start();
  }

  return { startVoiceRecognition, micButtonRef };
}
