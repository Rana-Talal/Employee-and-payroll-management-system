import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } 
  catch (e) {
  console.error("JWT parsing error:", e);
  return null;
}

}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    // استرداد التوكن من localStorage عند بدء التطبيق
    return localStorage.getItem("token") || null;
  });
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);

  // عند تغيير التوكن، استخرج البيانات منه وحدث localStorage
  useEffect(() => {
    if (token) {
      // تحديث localStorage
      localStorage.setItem("token", token);
      
      const payload = parseJwt(token);
      if (payload) {
        console.log("JWT Payload:", payload); // للتشخيص
        setUserId(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null);
        setUsername(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || payload["name"] || null);
        setRole(payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload["role"] || null);
      } else {
        console.error("Failed to parse JWT token");
        // في حال لم يمكن فك التوكن، أفرغ البيانات
        setUserId(null);
        setUsername(null);
        setRole(null);
      }
    } else {
      // عند حذف التوكن (تسجيل خروج)
      localStorage.removeItem("token");
      setUserId(null);
      setUsername(null);
      setRole(null);
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserId(null);
    setUsername(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        userId,
        setUserId,
        username,
        setUsername,
        role,
        setRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}