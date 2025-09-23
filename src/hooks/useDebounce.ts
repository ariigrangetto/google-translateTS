import { useCallback, useRef } from "react";
import { useTranslate } from "./useTranslate.ts";
import type { LanguageKeys } from "../types";

export default function useDebounce() {
  const timeoutId = useRef<number>(0);
  const translate = useTranslate();

  const debounceTranslate = useCallback(
    (input: string, sourceLanguage: string, targetLanguage: string) => {
      clearTimeout(timeoutId.current);
      timeoutId.current = setTimeout(() => {
        translate(
          input,
          sourceLanguage as LanguageKeys,
          targetLanguage as LanguageKeys
        );
      }, 500);
    },
    [translate]
  );

  return debounceTranslate;
}
