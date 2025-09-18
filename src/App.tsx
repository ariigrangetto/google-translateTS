import React, { useEffect, useState } from "react";
import "./App.css";
import { ArrowLeftRight, Copy, Mic, Volume1 } from "lucide-react";
import useCheckApiSupport from "./hooks/useCheckApiSupport.ts";
import useSwapLanguages from "./hooks/useSwapLanguages.ts";
import useUpdateStateContext from "./hooks/useUpdateStateContext.ts";
import useSpeakRecognition from "./hooks/useSpeakRecognition.ts";
import useVoiceRecognition from "./hooks/useVoiceRecognition.ts";
import useDebounce from "./hooks/useDebounce.ts";

function App() {
  const {
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,
    input,
    setInput,
    output,
    setOutput,
    updateDetectLanguage,
  } = useUpdateStateContext();

  const { checkApiSupport } = useCheckApiSupport();
  const { startVoiceRecognition, micButtonRef } = useVoiceRecognition();

  const debounceTranslate = useDebounce();
  const swapLanguages = useSwapLanguages();
  const { speakRecognition, speakerBtn } = useSpeakRecognition();

  const [copyText, setCopyText] = useState<string>("");

  useEffect(() => {
    checkApiSupport();
  }, []);

  const handleChangeInput = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    const newText = event.target.value;
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
                {updateDetectLanguage
                  ? `Detectar idioma (${updateDetectLanguage})`
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
