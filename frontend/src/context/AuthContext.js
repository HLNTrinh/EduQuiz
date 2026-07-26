import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/services";

const AuthContext = createContext(null);

const normalizeAuthError = (error) => {
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localToken = localStorage.getItem("token");
    const sessionToken = sessionStorage.getItem("token");
    const token = localToken || sessionToken;

    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .getMe()
      .then((data) => {
        const currentUser = data?.user || data;
        setUser(currentUser);
        const storage = localToken ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(currentUser));
      })
      .catch((error) => {
        console.log("Get user error:", normalizeAuthError(error));
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Đăng nhập
const login = async (email, password, rememberMe = false) => {
  try {
    const data = await authService.login({
      email,
      password,
    });

    const currentUser = data?.user || data;

    if (!rememberMe) {
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(currentUser));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } else {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(currentUser));
    }

    setUser(currentUser);

    return data;
  } catch (error) {
    throw new Error(normalizeAuthError(error));
  }
};


  // Đăng ký
  const register = async (name, email, password) => {
    try {
      return await authService.register({ name, email, password });
    } catch (error) {
      throw new Error(normalizeAuthError(error));
    }
  };

  // Đăng xuất
  const logout = () => {
    // Nếu có API logout thì gọi
    if (authService.logout) {
      authService.logout();
    }

    // Xóa dữ liệu đăng nhập
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Xóa user trong Context
    setUser(null);

    // Chuyển về trang đăng nhập phù hợp (admin hay user thường)
    const currentPath = window.location.pathname;
    const redirectPath = currentPath.startsWith("/admin") ? "/admin" : "/login";
    window.location.href = redirectPath;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
