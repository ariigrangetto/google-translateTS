import { DEFAULT_SOURCE_LANGUAGE } from "../constants";
import { FULL_LANGUAGES_CODE } from "../types.d";

export default function useLanguageCode() {
  function getFullLanguageCode(
    languageCode: keyof typeof FULL_LANGUAGES_CODE
  ): FULL_LANGUAGES_CODE {
    return FULL_LANGUAGES_CODE[languageCode] ?? DEFAULT_SOURCE_LANGUAGE;
  }

  return getFullLanguageCode;
}
