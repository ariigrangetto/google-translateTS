import { DEFAULT_SOURCE_LANGUAGE } from "../constants.ts";
import { FULL_LANGUAGES_CODE, type LanguageKeys } from "../types.d";

type LanguageOrAuto = LanguageKeys | "auto";

export default function useLanguageCode() {
  function getFullLanguageCode(languageCode: LanguageOrAuto): string {
    if (languageCode === "auto") {
      return DEFAULT_SOURCE_LANGUAGE;
    }
    return FULL_LANGUAGES_CODE[languageCode];
  }

  return getFullLanguageCode;
}
