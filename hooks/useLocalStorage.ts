
import { useState, useEffect, useRef } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // This effect is responsible for showing the "Saving..." state and then hiding it.
    // It's triggered by a change in storedValue.
    if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
    }

    // Set saving to true immediately
    setIsSaving(true);
    
    try {
      const valueToStore =
        typeof storedValue === 'function'
          ? storedValue(storedValue)
          : storedValue;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
    
    // Set a timeout to turn off the saving indicator after 1.5s
    saveTimeoutRef.current = window.setTimeout(() => {
        setIsSaving(false);
    }, 1500);

    // Cleanup timeout on unmount
    return () => {
        if(saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
    }

  }, [key, storedValue]);

  return [storedValue, setStoredValue, isSaving];
}