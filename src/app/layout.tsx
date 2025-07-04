import React from "react";
import "../css/globals.scss";

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html>
        <body className="mainpage">{children}</body>
      </html>
    )
  }