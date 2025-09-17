import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { ArrowLeftRight, Copy, Mic, Volume1 } from "lucide-react";
import {
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_TARGET_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from "./constants";
import { FULL_LANGUAGES_CODE } from "./types.d";

function useCheckApiSupport() {
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

interface useSwapLanguageProps {
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setOutput: React.Dispatch<React.SetStateAction<string>>;
  translate: (
    input: string,
    targetLanguage: string,
    sourceLanguage: string
  ) => string;
  output: string;
  sourceLanguage: string;
  targetLanguage: string;
  detectLanguage: (input: string) => string;
  setSourceLanguage: React.Dispatch<React.SetStateAction<string>>;
  setTargetLanguage: React.Dispatch<React.SetStateAction<string>>;
  input: string;
}
function useSwapLanguages({
  setInput,
  setOutput,
  translate,
  output,
  sourceLanguage,
  detectLanguage,
  setSourceLanguage,
  targetLanguage,
  setTargetLanguage,
  input,
}: useSwapLanguageProps) {
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

  return { swapLanguages };
}

function App() {
  const [sourceLanguage, setSourceLanguage] = useState(DEFAULT_SOURCE_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState(DEFAULT_TARGET_LANGUAGE);
  const { checkApiSupport } = useCheckApiSupport();

  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");

  const micButtonRef = useRef(null);
  const speakerBtn = useRef(null);
  const [detectedLanguage, setDetectLanguage] = useState<string | null>(null);

  const [copyText, setCopyText] = useState<string>("");

  useEffect(() => {
    checkApiSupport();
  }, []);

  //pasar swapLanguages a un hook

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

  const timeoutId = useRef<number>(0);
  const debounceTranslate = useCallback(
    (input: string, sourceLanguage: string, targetLanguage: string) => {
      clearTimeout(timeoutId.current);
      timeoutId.current = setTimeout(() => {
        translate(input, sourceLanguage, targetLanguage);
      }, 500);
    },
    [translate]
  );

  const currentDetector = useRef<string | null>(null);
  async function detectLanguage(text: string) {
    try {
      if (!currentDetector.current) {
        currentDetector.current = await window.LanguageDetector.create({
          expectedLanguages: SUPPORTED_LANGUAGES,
        });
      }
      const results = await currentDetector.current.detect(text);

      const detectedLanguage = results[0]?.detectedLanguage;

      return detectedLanguage === "und"
        ? DEFAULT_SOURCE_LANGUAGE
        : detectedLanguage;
    } catch (error) {
      console.error(error);
      return DEFAULT_SOURCE_LANGUAGE;
    }
  }

  function updateDetectedLanguage(lang: string): void {
    setDetectLanguage(lang);
  }

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

  const currentTranslatorKey = useRef<string | null>(null);
  const currentTranslator = useRef(null);

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

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newText = e.target.value;
    if (newText.length === 51) return;
    setInput(newText);
    debounceTranslate(newText, sourceLanguage, targetLanguage);
  };

  const handleSelectTarget = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const newTarget = e.target.value;
    setTargetLanguage(newTarget);
    debounceTranslate(input, sourceLanguage, newTarget);
  };

  const handleSelectSource = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const newSource = e.target.value;
    setSourceLanguage(newSource);
    debounceTranslate(input, newSource, targetLanguage);
  };

  const handleSwapLanguage = (): void => {
    swapLanguages();
  };

  function getFullLanguageCode(
    languageCode: keyof typeof FULL_LANGUAGES_CODE
  ): FULL_LANGUAGES_CODE {
    return FULL_LANGUAGES_CODE[languageCode] ?? DEFAULT_SOURCE_LANGUAGE;
  }

  async function handleCopyButton(): Promise<void> {
    try {
      await navigator.clipboard.writeText(output);
      setCopyText("Copy!");
      setTimeout(() => {
        setCopyText("");
      }, 1000);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div className='container'>
        <header className='header'>
          <div className='header-content'>
            <div className='logo'>
              <span className='google-g'>G</span>
              <span className='google-o1'>o</span>
              <span className='google-o2'>o</span>
              <span className='google-g'>g</span>
              <span className='google-l'>l</span>
              <span className='google-e'>e</span>
              <span className='traductor'>Traductor</span>
            </div>
          </div>
        </header>

        <section className='language-selection'>
          <div className='source-language'>
            <select
              id='sourceLanguage'
              value={sourceLanguage}
              onChange={handleSelectSource}
            >
              <option value='auto'>
                {detectedLanguage
                  ? `Detectar idioma (${detectedLanguage})`
                  : "Detectar idioma"}
              </option>
              <option value='en'>Inglés</option>
              <option value='es'>Español</option>
              <option value='fr'>Francés</option>
              <option value='de'>Alemán</option>
              <option value='it'>Italiano</option>
              <option value='pt'>Portugués</option>
              <option value='ru'>Ruso</option>
              <option value='ja'>Japonés</option>
              <option value='zh'>Chino</option>
            </select>
          </div>
          <button
            className='swap-languages icon-button'
            id='swapLanguages'
            onClick={handleSwapLanguage}
          >
            <span className='material-symbols-outlined'>
              <ArrowLeftRight />
            </span>
          </button>

          <div className='target-language'>
            <select
              id='targetLanguage'
              value={targetLanguage}
              onChange={handleSelectTarget}
            >
              <option value='en'>Inglés</option>
              <option value='es'>Español</option>
              <option value='fr'>Francés</option>
              <option value='de'>Alemán</option>
              <option value='it'>Italiano</option>
              <option value='pt'>Portugués</option>
              <option value='ru'>Ruso</option>
              <option value='ja'>Japonés</option>
              <option value='zh'>Chino</option>
            </select>
          </div>
        </section>
        <main className='translation-area'>
          <section className='input-section'>
            <div className='textarea-container'>
              <textarea
                id='inputText'
                placeholder='Escribe o habla'
                maxLength='5000'
                value={input}
                onChange={handleChangeInput}
              ></textarea>
            </div>
            <footer className='input-controls'>
              <button
                className='icon-button mic-button'
                id='micButton'
                onClick={startVoiceRecognition}
                ref={micButtonRef}
              >
                <span className='material-symbols-outlined'>
                  <Mic />
                </span>
              </button>
              <p
                className='length-limit'
                id='length-limit'
                style={{ color: input.length >= 50 ? "red" : "black" }}
              >
                <span id='length'>{input.length}</span> / 50
              </p>
            </footer>
          </section>

          <section className='output-section'>
            <div className='textarea-container'>
              <textarea
                readOnly
                id='outputText'
                value={output}
                placeholder='Traducción '
                onChange={(e) => setOutput(e.target.value)}
              ></textarea>

              <footer className='output-controls'>
                <button
                  className='icon-button copy-button'
                  id='copyButton'
                  onClick={handleCopyButton}
                >
                  <span className='material-symbols-outlined'>
                    <Copy />
                  </span>
                  <p id='copyText'>{copyText}</p>
                </button>

                <button
                  className='icon-button speaker-button'
                  id='speakerButton'
                  onClick={speakRecognition}
                  ref={speakerBtn}
                >
                  <span className='material-symbols-outlined'>
                    <Volume1 />
                  </span>
                </button>
              </footer>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default App;
