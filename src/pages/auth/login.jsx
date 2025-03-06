import React, { memo } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Login = memo(() => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = Object.fromEntries(new FormData(e.target));

    try {
      await axios
        .post("https://clothing-store-web-server.vercel.app/api/auth/login", value)
        .then((res) => {
          console.log(res);
          const token = res.data.token;
          const role = res.data.role;
          localStorage.setItem("access_token", JSON.stringify(token));
          localStorage.setItem("role", role);
          window.location.reload()
        });
      // if ((token, role)) {
      //   localStorage.setItem("access_token", JSON.stringify(token));
      //   localStorage.setItem("role", role);
      //   window.location.reload();
      // } else {
      //   console.error("Javobda kerakli ma'lumotlar mavjud emas.");
      // }
    } catch (error) {
      console.error("API xatosi:", error.response?.data || error.message);
    }
  };

  return (
    <div className="login">
      <form className="login-form" onSubmit={handleSubmit}>
        {/* <h1>Stomatologiya Admin</h1> */}
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
          <input type="submit" value="Kirish" />
        </label>
      </form>
    </div>
  );
});
