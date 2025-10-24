import { createContext, useReducer, useCallback, type ReactNode } from "react";
import { setUserToken } from "../api/shared";

type Theme = "light" | "dark";
type User = { id: string; user_id: string; role: string; token: string };

interface State {
  theme: Theme;
  user: User | null;
}

type Action = { type: "t_toggle_theme" } | { type: "t_set_user"; payload: User } | { type: "t_logout" };

type Reducer = (state: State, action: Action) => State;

const Reducer: Reducer = (state, action) => {
  switch (action.type) {
    case "t_toggle_theme":
      return { ...state, theme: state.theme === "light" ? "dark" : "light" };
    case "t_set_user":
      localStorage.setItem("user", JSON.stringify(action.payload));
      setUserToken(action.payload.token);
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
  const user = rawUser ? JSON.parse(rawUser!) : null;
  const [state, dispatch] = useReducer(Reducer, {
    theme: "light",
    user: rawUser ? JSON.parse(rawUser!) : null
  });

  setUserToken(user?.token);

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
