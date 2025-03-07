import React, { useState, memo } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Login = memo(() => {
  const [loading, setLoading] = useState(false); // Состояние для спинера
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = Object.fromEntries(new FormData(e.target));
    setLoading(true); // Показываем спинер

    try {
      await axios
        .post("https://stomatology-web-server.vercel.app/api/auth/login", value)
        .then((res) => {
          console.log(res);
          const token = res.data.token;
          const role = res.data.role;
          localStorage.setItem("access_token", JSON.stringify(token));
          localStorage.setItem("role", role);
          window.location.reload();
        });
    } catch (error) {
      console.error("API xatosi:", error.response?.data || error.message);
    } finally {
      setLoading(false); // Скрываем спинер
    }
  };

  return (
    <div className="login">
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          <input
            type="text"
            placeholder="Login"
            autoComplete="off"
            name="username"
          />
        </label>

        <label>
          <input type="password" placeholder="Password" name="password" />
        </label>

        <label>
          <button type="submit" disabled={loading}>
            {loading ? (
              <div className="spinner"></div>
            ) : (
              "Kirish"
            )}
          </button>
        </label>
      </form>
    </div>
  );
});
