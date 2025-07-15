"use client"

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function Page() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:3001/api/boards")
      .then((res) => res.json())
      .then((data) => {
        setBoards(data.boards || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load boards: "+err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <div>
        <Image src="/images/logo.png" alt="logo" width={1827} height={635} />
        <h1>Welcome to the Boards!</h1>
        {loading && <p></p>}
        {error && <p style={{color: 'red'}}>{error}</p>}
        {boards.map((board) => (
          <Link href={`/${board.name}`} key={board.id}>{board.name}</Link>
        ))}
        <Link href="/new">new</Link>
      </div>
    </>
  );
}