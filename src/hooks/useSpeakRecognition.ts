import { useRef } from "react";
import useUpdateStateContext from "./useUpdateStateContext.ts";
import useLanguageCode from "./useLanguageCode.ts";

declare global {
  interface Window {
    speechsnthesis: SpeechSynthesis;
  }
}

export default function useSpeakRecognition() {
  const getFullLanguageCode = useLanguageCode();
  const speakerBtn = useRef<HTMLButtonElement | null>(null);
  const { output, targetLanguage } = useUpdateStateContext();

  function speakRecognition(): void {
    const hasNativeSuportSynthesis = "speechSynthesis" in window;
    if (!hasNativeSuportSynthesis || !speakerBtn.current) return;

    const text = output;
    if (!text) return;

    //in case you want to change the default voice
    const voices = window.speechSynthesis.getVoices();
    console.log(voices);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getFullLanguageCode(targetLanguage);
    utterance.rate = 0.9;

    utterance.onstart = () => {
      if (speakerBtn.current) {
        speakerBtn.current.style.backgroundColor = "var(--google-green)";
        speakerBtn.current.style.color = "white";
      }
    };

    utterance.onend = () => {
      if (speakerBtn.current) {
        speakerBtn.current.style.backgroundColor = "";
        speakerBtn.current.style.color = "";
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  return { speakRecognition, speakerBtn };
}
