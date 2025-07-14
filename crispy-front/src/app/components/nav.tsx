"use client"

import Link from "next/link";
import "../../css/nav.css";
import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function Nav() {
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
                setError("Failed to load boards");
                setLoading(false);
            });
    }, []);

    return (
        <nav className="nav">
            <Link className="nava" href={`/`}>
                <Image src="/images/logo.png" alt="logo" width={1827} height={635} />
            </Link>

            <div className="navmap">
                {loading && <span>Loading...</span>}
                {error && <span style={{color: 'red'}}>{error}</span>}
                {boards.map((board) => (
                    <Link href={`/${board.name}`} key={board.id}>
                        {board.name} - {board.displayName || board.name}
                    </Link>
                ))}
            </div>
        </nav>
    );
}