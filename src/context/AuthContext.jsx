import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Decode or fetch user profile if token exists
      // For now, we store user data in localStorage on login
      const savedUser = localStorage.getItem("adminUser");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setLoading(false);
  }, [token]);

  const login = useCallback((userData, userToken) => {
    if (!userData?._id) {
      console.error("Login Error: User data is missing _id!", userData);
    }
    localStorage.setItem("adminToken", userToken);
    localStorage.setItem("adminUser", JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback((updatedUser) => {
    localStorage.setItem("adminUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, updateProfile, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
