import { createContext, useReducer, useCallback, useEffect, type ReactNode } from "react";

type Theme = "light" | "dark";
type User = { id: string; user_id: string; role: string; token: string };

const THEME_STORAGE_KEY = "admin_theme";
const isBrowser = typeof window !== "undefined";

function getDeviceTheme(): Theme {
  if (!isBrowser) {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface State {
  theme: Theme;
  user: User | null;
}

type Action =
  | { type: "t_toggle_theme" }
  | { type: "t_set_theme"; payload: Theme }
  | { type: "t_set_user"; payload: User }
  | { type: "t_logout" };

type Reducer = (state: State, action: Action) => State;

const Reducer: Reducer = (state, action) => {
  switch (action.type) {
    case "t_toggle_theme": {
      const newTheme = state.theme === "light" ? "dark" : "light";
      if (isBrowser) {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      }
      return { ...state, theme: newTheme };
    }
    case "t_set_theme":
      return { ...state, theme: action.payload };
    case "t_set_user":
      localStorage.setItem("user", JSON.stringify(action.payload));
      return { ...state, user: action.payload };
    case "t_logout":
      localStorage.removeItem("user");
      return { ...state, user: null };
  }
};

interface StoreContextType {
  theme: Theme;
  user: User | null;
  toggleTheme: () => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const StoreProvider = ({ children }: { children: ReactNode }) => {
  const rawUser = localStorage.getItem("user");

  // Get stored theme or fall back to device theme
  const getInitialTheme = (): Theme => {
    if (!isBrowser) {
      return "light";
    }
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (storedTheme && (storedTheme === "light" || storedTheme === "dark")) {
      return storedTheme;
    }
    return getDeviceTheme();
  };

  const [state, dispatch] = useReducer(Reducer, {
    theme: getInitialTheme(),
    user: rawUser ? JSON.parse(rawUser!) : null
  });

  // Listen for device theme changes (only if no manually set theme)
  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    const hasStoredTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (hasStoredTheme && (hasStoredTheme === "light" || hasStoredTheme === "dark")) {
      return; // Don't override manually set theme
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = (event: MediaQueryListEvent) => {
      dispatch({ type: "t_set_theme", payload: event.matches ? "dark" : "light" });
    };
    media.addEventListener("change", syncTheme);
    return () => media.removeEventListener("change", syncTheme);
  }, []);

  // Apply theme class to body
  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    document.body.classList.remove("light", "dark");
    document.body.classList.add(state.theme);
  }, [state.theme]);

  const toggleTheme = useCallback(() => {
    dispatch({ type: "t_toggle_theme" });
  }, []);

  const setUser = useCallback((user: User) => {
    dispatch({ type: "t_set_user", payload: user });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: "t_logout" });
  }, []);

  const contextValue: StoreContextType = {
    theme: state.theme,
    user: state.user,
    toggleTheme,
    setUser,
    logout
  };

  return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>;
};

export { StoreContext, StoreProvider };
