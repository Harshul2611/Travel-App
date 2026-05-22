import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { setAccessToken } from "../api/axios.js";
import api from "../api/axios.js";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  setUserFromGoogle: (user: User, token: string) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // true on app load

  // On app load — silently refresh to restore session
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const response = await api.post("/auth/refresh");
        if (isMounted) {
          const { accessToken: newToken, user: userData } = response.data;
          setAccessToken(newToken);
          setToken(newToken);
          setUser(userData);
        }
      } catch {
        // No valid refresh token — user needs to login
        // Do NOT redirect here — just set null
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { accessToken: newToken, user: userData } = response.data;
    setAccessToken(newToken);
    setToken(newToken);
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    const { accessToken: newToken, user: userData } = response.data;
    setAccessToken(newToken);
    setToken(newToken);
    setUser(userData);
  };

  const setUserFromGoogle = (userData: User, token: string) => {
    setAccessToken(token);
    setToken(token);
    setUser(userData);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setAccessToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        register,
        setUserFromGoogle,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
