import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { initialState, reducer, type Action } from './reducer.ts';
import type { AppState } from './types.ts';

const STORAGE_KEY = 'upkeep/state/v1';

const StoreContext = createContext<{ state: AppState; dispatch: (a: Action) => void } | null>(null);

/** Holds all app data on the device and saves it after every change. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [loaded, setLoaded] = useState(false);
  const skipNextSave = useRef(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) dispatch({ type: 'hydrate', state: mergeDefaults(JSON.parse(raw)) });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  if (!loaded) return null;
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

/** Adds any default categories introduced after the user's data was saved. */
function mergeDefaults(saved: AppState): AppState {
  const fresh = initialState();
  const known = new Set(saved.categories.map((c) => c.id));
  const missing = fresh.categories.filter((c) => !known.has(c.id));
  return { ...fresh, ...saved, categories: [...missing, ...saved.categories] };
}
