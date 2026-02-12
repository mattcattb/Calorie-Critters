import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type LogFoodModalContextValue = {
  isOpen: boolean;
  openLog: () => void;
  closeLog: () => void;
  setOpen: (open: boolean) => void;
};

const LogFoodModalContext = createContext<LogFoodModalContextValue | null>(null);

export function LogFoodModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openLog = useCallback(() => setIsOpen(true), []);
  const closeLog = useCallback(() => setIsOpen(false), []);
  const setOpen = useCallback((open: boolean) => setIsOpen(open), []);

  const value = useMemo(
    () => ({ isOpen, openLog, closeLog, setOpen }),
    [closeLog, isOpen, openLog, setOpen],
  );

  return (
    <LogFoodModalContext.Provider value={value}>
      {children}
    </LogFoodModalContext.Provider>
  );
}

export function useLogFoodModal() {
  const context = useContext(LogFoodModalContext);
  if (!context) {
    throw new Error("useLogFoodModal must be used within LogFoodModalProvider");
  }
  return context;
}
