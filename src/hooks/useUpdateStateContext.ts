import { useContext } from "react";
import { UpdateStateContext } from "../context/updateStateContext.ts";

export default function useUpdateStateContext() {
  const ctx = useContext(UpdateStateContext);

  if (!ctx) {
    throw new Error("useUpdateStateContext must be used whitin a provider");
  }

  return ctx;
}
