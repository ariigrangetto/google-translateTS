import { useRef } from "react";
import useUpdateStateContext from "./useUpdateStateContext.ts";
import useLanguageCode from "./useLanguageCode.ts";

export default function useSpeakRecognition() {
  const getFullLanguageCode = useLanguageCode();
  const speakerBtn = useRef<null>(null);
  const { output, targetLanguage } = useUpdateStateContext();

  function speakRecognition() {
    const hasNativeSuportSynthesis = "SpeechSynthesis" in window;
    if (!hasNativeSuportSynthesis) return;

    const text = output;
    if (!text) return;

    //in case you want to change the default voice
    const voices = speechSynthesis.getVoices();
    console.log(voices);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getFullLanguageCode(targetLanguage);
    utterance.rate = 0.9;

    utterance.onstart = () => {
      speakerBtn.current.style.backgroundColor = "var(--google-green)";
      speakerBtn.current.style.color = "white";
    };

    utterance.onend = () => {
      speakerBtn.current.style.backgroundColor = "";
      speakerBtn.current.style.color = "";
    };

    window.speechSynthesis.speak(utterance);
  }

  return { speakRecognition, speakerBtn };
}
