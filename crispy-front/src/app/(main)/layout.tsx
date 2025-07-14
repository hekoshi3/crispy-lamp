import React from "react";
import "../../css/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <title>boards</title>
      <div>
        <main className="mainpage">{children}</main>
      </div>
    </>
  )
}