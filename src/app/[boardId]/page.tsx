import React from "react";

export default function Board({ params }: { params: { boardId: string } }) {
    const { boardId } = params;
    return (
        <div>
            <h1>{boardId}</h1>
        </div>
    )
}