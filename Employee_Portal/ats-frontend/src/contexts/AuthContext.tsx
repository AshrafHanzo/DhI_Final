import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "@/config/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Load user from storage on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const lastActivity = localStorage.getItem("lastActivity");

    if (savedUser && lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity);

      // Only restore session if less than 30 minutes have passed
      if (timeSinceLastActivity < IDLE_TIMEOUT) {
        setUser(JSON.parse(savedUser));
        lastActivityRef.current = Date.now();
      } else {
        // Session expired, clear storage
        localStorage.removeItem("user");
        localStorage.removeItem("lastActivity");
      }
    }
    setLoading(false);
  }, []);

  // Setup idle timeout detection
  useEffect(() => {
    if (!user) return;

    const resetIdleTimer = () => {
      lastActivityRef.current = Date.now();
      localStorage.setItem("lastActivity", Date.now().toString());

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      idleTimerRef.current = setTimeout(() => {
        // Auto logout after 30 minutes of inactivity
        logout();
      }, IDLE_TIMEOUT);
    };

    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Initial setup
    resetIdleTimer();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer);
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer);
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [user]);

  // Login API call
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();

      // API returns { message, user: { id, name, email, role } }
      const userData: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        is_active: true
      };

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("lastActivity", Date.now().toString());
      setUser(userData);
      lastActivityRef.current = Date.now();

      // Redirect after login
      navigate("/dashboard");

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("lastActivity");
    setUser(null);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
