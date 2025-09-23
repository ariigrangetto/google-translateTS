/* eslint-disable react/react-in-jsx-scope */
import { createContext, useState } from "react";
import {
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_TARGET_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from "../constants.ts";

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

type UpdateStateContextType = {
  sourceLanguage: string;
  setSourceLanguage: (lang: string) => void;
  targetLanguage: SupportedLanguage;
  setTargetLanguage: (lang: SupportedLanguage) => void;
  input: string;
  setInput: (value: string) => void;
  output: string;
  setOutput: (value: string) => void;
  updateDetectLanguage: string;
  setUpdateDetectLanguage: (lang: string) => void;
};

export const UpdateStateContext = createContext<UpdateStateContextType | null>(
  null
);

export default function UpdateStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sourceLanguage, setSourceLanguage] = useState(DEFAULT_SOURCE_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>(
    DEFAULT_TARGET_LANGUAGE as SupportedLanguage
  );
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [updateDetectLanguage, setUpdateDetectLanguage] = useState<string>("");

  return (
    <UpdateStateContext.Provider
      value={{
        sourceLanguage,
        setSourceLanguage,
        targetLanguage,
        setTargetLanguage,
        input,
        setInput,
        output,
        setOutput,
        updateDetectLanguage,
        setUpdateDetectLanguage,
      }}
    >
      {children}
    </UpdateStateContext.Provider>
  );
}
