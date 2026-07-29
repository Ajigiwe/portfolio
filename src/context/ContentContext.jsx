import { createContext, useContext, useState, useEffect, useCallback } from "react";
import defaultData from "../data/content";

const STORAGE_KEY = "portfolio_content";

const ContentContext = createContext();

function loadSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function ContentProvider({ children }) {
  const [data, setData] = useState(() => loadSaved() || defaultData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
  }, []);

  const resetData = useCallback(() => {
    setData(structuredClone(defaultData));
  }, []);

  return (
    <ContentContext.Provider value={{ data, updateData, resetData, defaultData }}>
      {children}
    </ContentContext.Provider>
  );
}

export const useContent = () => useContext(ContentContext);
