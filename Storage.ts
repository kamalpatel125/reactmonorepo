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



-------------
  time zone
------------

  import { useState, useEffect } from "react";

// ----------- UTILITIES -----------
function computeExpiry(hour = 0, minute = 1): Date {
  const now = new Date();
  const expiry = new Date();
  expiry.setHours(hour, minute, 0, 0);
  if (now > expiry) expiry.setDate(expiry.getDate() + 1);
  return expiry;
}

function setLocalCache<T>(key: string, value: T, hour = 0, minute = 1) {
  const expiry = computeExpiry(hour, minute);
  const payload = { value, expiry: expiry.toISOString() };
  localStorage.setItem(key, JSON.stringify(payload));
}

function getLocalCache<T>(key: string): { value: T | null; expired: boolean } {
  const item = localStorage.getItem(key);
  if (!item) return { value: null, expired: false };
  try {
    const parsed = JSON.parse(item);
    const now = new Date();
    const expiry = new Date(parsed.expiry);
    if (now > expiry) {
      localStorage.removeItem(key);
      return { value: null, expired: true };
    }
    return { value: parsed.value as T, expired: false };
  } catch {
    return { value: null, expired: false };
  }
}

// ----------- HOOK -----------
export function useSharedDailyCache<T>(
  key: string,
  initialValue: T,
  expiryHour = 0,
  expiryMinute = 1
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const { value } = getLocalCache<T>(key);
    return value ?? initialValue;
  });

  // Channel for real-time sync
  const channel = new BroadcastChannel(`shared_cache_${key}`);

  // Persist + broadcast changes
  useEffect(() => {
    setLocalCache(key, value, expiryHour, expiryMinute);
    channel.postMessage({
      key,
      value,
      expiry: computeExpiry(expiryHour, expiryMinute).toISOString(),
    });
  }, [key, value, expiryHour, expiryMinute]);

  // Listen for broadcast messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.key !== key) return;

      const expiry = new Date(data.expiry);
      if (new Date() > expiry) {
        // Expired → clear and reset
        localStorage.removeItem(key);
        setValue(initialValue);
        return;
      }
      setValue(data.value as T);
      setLocalCache(key, data.value, expiryHour, expiryMinute);
    };

    channel.addEventListener("message", handleMessage);
    return () => channel.removeEventListener("message", handleMessage);
  }, [key, initialValue, expiryHour, expiryMinute]);

  // Sync via `storage` event (fallback for other tabs)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== key || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        const expiry = new Date(parsed.expiry);
        if (new Date() > expiry) {
          localStorage.removeItem(key);
          setValue(initialValue);
          return;
        }
        setValue(parsed.value as T);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, initialValue]);

  // Expiry check on focus
  useEffect(() => {
    const handleFocus = () => {
      const { value: cached, expired } = getLocalCache<T>(key);
      if (expired) {
        setValue(initialValue);
      } else if (cached !== null) {
        setValue(cached);
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [key, initialValue]);

  // Clean up channel
  useEffect(() => {
    return () => channel.close();
  }, []);

  return [value, setValue];
}


export function getTimeUntilExpiry(hour = 0, minute = 1): number {
  const now = new Date();
  const expiry = computeExpiry(hour, minute);
  return expiry.getTime() - now.getTime(); // ms remaining
}
















