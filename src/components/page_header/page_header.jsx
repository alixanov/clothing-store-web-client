import React, { memo } from "react";
import "./page_header.css";

export const PageHeader = memo(({ title, children }) => {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      <div className="page-header__actions">{children}</div>
    </div>
  );
});
