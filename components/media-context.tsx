"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface MediaContextType {
  expandedId: string | null;
  isClosing: boolean;
  setExpandedId: (id: string | null) => void;
}

const MediaContext = createContext<MediaContextType | null>(null);

export function MediaProvider({ children }: { children: ReactNode }) {
  const [expandedId, setExpandedIdState] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const setExpandedId = useCallback((id: string | null) => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (id === null) {
      setExpandedIdState(null);
      setIsClosing(true);
      closeTimerRef.current = window.setTimeout(() => {
        setIsClosing(false);
        closeTimerRef.current = null;
      }, 320);
      return;
    }

    setIsClosing(false);
    setExpandedIdState(id);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <MediaContext.Provider value={{ expandedId, isClosing, setExpandedId }}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error("useMedia must be used within a MediaProvider");
  }
  return context;
}
