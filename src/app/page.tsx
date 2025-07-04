import Link from "next/link";
import React from "react";
import sampleBoards from "./components/sampleBoards.json";
import Image from "next/image";

export default function Page() {
    return (
        <div>
          <Image src="/images/logo.png" alt="logo" width={1827} height={635} />
          <h1>Welcome to the Boards!</h1>
            {sampleBoards.boards.map((board) => (
                <Link href={`/${board.id}`} key={board.id}>{board.name}</Link>
            ))}
            <Link href="/new">New Board</Link>
        </div>
    )
  }