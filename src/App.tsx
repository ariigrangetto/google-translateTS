import React, { useEffect, useState } from "react";
import "./App.css";
import { ArrowLeftRight, Copy, Mic, Volume1 } from "lucide-react";
import useCheckApiSupport from "./hooks/useCheckApiSupport.ts";
import useSwapLanguages from "./hooks/useSwapLanguages.ts";
import useUpdateStateContext from "./hooks/useUpdateStateContext.ts";
import useSpeakRecognition from "./hooks/useSpeakRecognition.ts";
import useVoiceRecognition from "./hooks/useVoiceRecognition.ts";
import useDebounce from "./hooks/useDebounce.ts";
import type { LanguageKeys } from "./types.d";

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
    setTargetLanguage(newTarget as LanguageKeys);
    debounceTranslate(input, sourceLanguage, newTarget);
  };

  const handleSelectSource = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const newSource = e.target.value;
    setSourceLanguage(newSource);
    debounceTranslate(input, newSource, targetLanguage);
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
      <div className='container '>
        <header className='header'>
          <div className='header-content flex items-center justify-between'>
            <div className='logo text-[22px] font-normal flex items-center'>
              <span className='google-g text-[#4285f4]'>G</span>
              <span className='google-o1 text-[#ea4335]'>o</span>
              <span className='google-o2 text-[#fbbc05]'>o</span>
              <span className='google-g text-[#4285f4]'>g</span>
              <span className='google-l text-[#34a853]'>l</span>
              <span className='google-e text-[#ea4335]'>e</span>
              <span className='traductor text-[#5f6368] ml-[4px]'>
                Traductor
              </span>
            </div>
          </div>
        </header>

        <section className='language-selection  flex items-center justify-center p-[24px] gap-[100px]'>
          <div className='source-language flex-1 max-w-[200px]'>
            <select
              id='sourceLanguage'
              value={sourceLanguage}
              onChange={handleSelectSource}
              className='bg-[#0e0e0e]'
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
            className='swap-languages icon-button flex items-center border-0 bg-[#0e0e0e] justify-center m-auto text-white cursor-pointer rounded[50%] p-[6px] *:duration-200 active:scale-90'
            id='swapLanguages'
            onClick={swapLanguages}
          >
            <span className='material-symbols-outlined '>
              <ArrowLeftRight size={16} />
            </span>
          </button>

          <div className='target-language flex-1 max-w-[200px]'>
            <select
              id='targetLanguage'
              value={targetLanguage}
              onChange={handleSelectTarget}
              className='bg-[#0e0e0e]'
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
        <main
          className='translation-area
        flex h-[250px] border-t-[1px] border-t-[#e8eaed05]'
        >
          <section className='input-section flex-1 flex flex-col border-r-[1px] border-[#e8eaed05]'>
            <div className='textarea-container flex-1 flex flex-col relative'>
              <textarea
                id='inputText'
                placeholder='Type or speak!'
                maxLength={5000}
                value={input}
                onChange={handleChangeInput}
              ></textarea>
            </div>
            <footer className='h-[40px] input-controls flex justify-between items-center p-[12px] border-t border-b border-[#e8eaed05]'>
              <button
                className='icon-button mic-button'
                id='micButton'
                onClick={startVoiceRecognition}
                ref={micButtonRef}
              >
                <span className='material-symbols-outlined'>
                  <Mic size={20} />
                </span>
              </button>
              <p
                className='length-limit text-[12px]'
                id='length-limit'
                style={{ color: input.length >= 50 ? "red" : "white" }}
              >
                <span id='length'>{input.length}</span> / 50
              </p>
            </footer>
          </section>

          <section className='output-section flex-1 flex flex-col'>
            <div className='textarea-container flex-1 flex flex-col relative'>
              <textarea
                readOnly
                id='outputText'
                value={output}
                placeholder='Traducción '
                onChange={(e) => setOutput(e.target.value)}
              ></textarea>

              <footer className='h-[40px] input-controls flex justify-between items-center p-[12px] border-t border-b border-[#e8eaed05]'>
                <button
                  className='icon-button copy-button flex items-center justify-center gap-2'
                  id='copyButton'
                  onClick={handleCopyButton}
                >
                  <Copy size={20} />
                  <p id='copyText' className='text-[15px] ml-[10px]'>
                    {copyText}
                  </p>
                </button>

                <button
                  className='icon-button speaker-button'
                  id='speakerButton'
                  onClick={speakRecognition}
                  ref={speakerBtn}
                >
                  <span className='material-symbols-outlined'>
                    <Volume1 size={20} />
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
