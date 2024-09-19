import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    user: null,
  });

  //Load token and user from local Storage in initial render
  useEffect(() => {
    const auth = localStorage.getItem("auth");
    const user = JSON.parse(localStorage.getItem("user"));
    setAuth({ auth, user });
  }, []);

  const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuth({ token, user });
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ login, logout, auth }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context == undefined) {
    throw new Error("AuthContext was used outside AuthProvider");
  }
  return context;
};

export { useAuth, AuthProvider };
