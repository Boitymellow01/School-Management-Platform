import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

export function useFetch(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(() => {
    if (!path) return;
    setError("");
    api.get(path).then(setData).catch((e) => setError(e.message));
  }, [path]);
  useEffect(load, [load]);
  return { data, error, reload: load };
}

export const fmtDate = (d) => new Date(d).toLocaleDateString();
export const today = () => new Date().toISOString().slice(0, 10);
