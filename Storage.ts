import { useEffect, useState } from "react";

const STORAGE_PREFIX = "daily_";

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0]; // e.g. '2025-10-09'
}

export function setDailyValue<T>(key: string, value: T): void {
  const todayKey = getTodayKey();
  const data = { value, date: todayKey };
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
}

export function getDailyValue<T>(key: string): T | null {
  const stored = localStorage.getItem(STORAGE_PREFIX + key);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return parsed.date === getTodayKey() ? (parsed.value as T) : null;
  } catch {
    return null;
  }
}

export function clearIfExpired<T>(
  key: string,
  resetValue: (v: T) => void,
  initialValue: T
) {
  const stored = localStorage.getItem(STORAGE_PREFIX + key);
  if (!stored) return;
  try {
    const parsed = JSON.parse(stored);
    if (parsed.date !== getTodayKey()) {
      localStorage.removeItem(STORAGE_PREFIX + key);
      resetValue(initialValue);
    }
  } catch {
    localStorage.removeItem(STORAGE_PREFIX + key);
    resetValue(initialValue);
  }
}

export function useDailyLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const stored = getDailyValue<T>(key);
    return stored ?? initialValue;
  });

  useEffect(() => {
    setDailyValue(key, value);
  }, [key, value]);

  // 🔹 Check only when tab gains focus
  useEffect(() => {
    const handleFocus = () => {
      clearIfExpired(key, setValue, initialValue);
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [key, initialValue]);

  return [value, setValue];
}
