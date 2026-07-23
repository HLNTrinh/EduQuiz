import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/services";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .getMe()
      .then((data) => {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      })
      .catch((error) => {
        console.log("Get user error:", error.message);

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Đăng nhập
  const login = async (email, password, rememberMe = false) => {
    const data = await authService.login({
      email,
      password,
    });

    if (!rememberMe) {
      // Nếu không chọn "Ghi nhớ", dùng sessionStorage thay vì localStorage
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setUser(data.user);

    return data;
  };

  // Đăng ký
  const register = async (name, email, password) => {
    return authService.register({
      name,
      email,
      password,
    });
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

    // Xóa user trong Context
    setUser(null);

    // Chuyển về trang đăng nhập
    window.location.replace("/login");
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