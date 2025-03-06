import React, { memo } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./layout/layout";
import { Login } from "./pages/auth/login";
import { Admin } from "./pages/admin/admin";
import Kassa from "./pages/kassa/kassa2.0/Kassa";
import Debt from "./pages/debt/debt";

export const Routera = memo(() => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("access_token") || null;

  return (
    <>
      {token ? (
        <Routes>
          {/* Layout komponentini asosiy tarkib sifatida qo'shamiz */}
          <Route path="/" element={<Layout />}>
            <Route path="/debt" element={<Debt />} />
            <Route path="*" element={<h1>page notfound</h1>} />
            {/* Admin yoki Seller roli bo'yicha farqlash */}
            <Route index element={role === "seller" ? <Kassa /> : <Admin />} />
          </Route>
        </Routes>
      ) : (
        <Login />
      )}
    </>
  );
});
