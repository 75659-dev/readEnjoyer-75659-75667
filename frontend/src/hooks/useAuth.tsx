import { useCallback, useEffect, useState } from "react";

export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => localStorage.getItem("isAuthenticated") === "true",
  );
  const [user, setUser] = useState<string | null>(() =>
    localStorage.getItem("authUser"),
  );

  useEffect(() => {
    const onChange = () => {
      setIsAuthenticated(localStorage.getItem("isAuthenticated") === "true");
      setUser(localStorage.getItem("authUser"));
    };
    window.addEventListener("authChange", onChange);
    return () => window.removeEventListener("authChange", onChange);
  }, []);

  const login = useCallback((name = "User", accessToken?: string) => {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("authUser", name);
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }
    setIsAuthenticated(true);
    setUser(name);
    window.dispatchEvent(new Event("authChange"));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("authUser");
    localStorage.removeItem("accessToken");
    setIsAuthenticated(false);
    setUser(null);
    window.dispatchEvent(new Event("authChange"));
  }, []);

  return { isAuthenticated, user, login, logout } as const;
}
