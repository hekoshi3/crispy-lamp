"use client"

import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { ThreadPreview } from '../../components/threadPrev';
import { findSourceMap } from "module";
import { notFound } from "next/navigation";

export default function Board({ params }: { params: Promise<{ boardName: string }> }) {
    const paramsObj = React.use(params);
    const boardName = paramsObj.boardName;
    const [threads, setThreads] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [boardId, setBoardId] = useState<string | null>(null);

    // Thread creation state
    const [content, setContent] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imageAlt, setImageAlt] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch boardId, threads, and posts
    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch("http://127.0.0.1:3001/api/boards")
            .then(res => res.json())
            .then(data => {
                const board = (data.boards || []).find((b: any) => b.name === boardName);
                if (board) {
                    setBoardId(board.id);
                    // Fetch threads for this board
                    return fetch(`http://127.0.0.1:3001/api/threads?boardId=${board.id}`)
                        .then(res => res.json())
                        .then(threadData => {
                            setThreads(threadData.threads || []);
                            // Fetch all posts (for replies count)
                            return fetch("http://127.0.0.1:3001/api/posts");
                        })
                        .then(res => res.json())
                        .then(postData => {
                            setPosts(postData.posts || []);
                            setLoading(false);
                        });
                } else {
                    setError("Board not found");
                    setLoading(false);
                    notFound()                    
                }
            })
            .catch(() => {
                setError("Failed to load board data");
                setLoading(false);
                notFound();
            });
    }, [boardName]);

    // Thread creation handler
    async function handleCreateThread(e: React.FormEvent) {
        e.preventDefault();
        setCreating(true);
        setCreateError(null);
        let uploadedImageUrl = null;
        try {
            if (!content.trim()) {
                setCreateError("Content is required");
                setCreating(false);
                return;
            }
            if (!boardId) {
                setCreateError("Board not found");
                setCreating(false);
                return;
            }
            // Upload image if present
            if (image) {
                const formData = new FormData();
                formData.append("image", image);
                const uploadRes = await fetch("http://127.0.0.1:3001/api/upload/image", {
                    method: "POST",
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (!uploadData.success) {
                    setCreateError(uploadData.error || "Image upload failed");
                    setCreating(false);
                    return;
                }
                uploadedImageUrl = `http://127.0.0.1:3001${uploadData.imageUrl}`;
            }
            // Create thread
            const threadRes = await fetch("http://127.0.0.1:3001/api/threads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    boardId,
                    content: content.trim(),
                    imageUrl: uploadedImageUrl,
                    imageAlt: imageAlt.trim() || undefined
                })
            });
            const threadData = await threadRes.json();
            if (!threadRes.ok) {
                setCreateError(threadData.error || "Failed to create thread");
                setCreating(false);
                return;
            }
            // Reset form
            setContent("");
            setImage(null);
            setImageAlt("");
            if (fileInputRef.current) fileInputRef.current.value = "";
            // Refresh threads
            setThreads((prev) => [threadData.thread, ...prev]);
        } catch (err) {
            setCreateError("Failed to create thread");
        } finally {
            setCreating(false);
        }
    }
    if (error === null){
    return (
        <>
            <title>{boardName}</title>
            <div className="board">
                <BoardImg boardName={boardName} />
                {/* Thread creation form */}
                <form onSubmit={handleCreateThread} style={{ marginBottom: 24, background: '#333', padding: 16, borderRadius: 8, maxWidth: 450 }}>
                    <h2>Create a new thread</h2>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Thread content..."
                        rows={3}
                        style={{ width: '100%', marginBottom: 8 }}
                        required
                    />
                    <br />
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={e => setImage(e.target.files?.[0] || null)}
                        style={{ marginBottom: 8 }}
                    />
                    <br />
                    <button type="submit" disabled={creating} style={{ padding: '8px 16px' }}>
                        {creating ? "Creating..." : "Create Thread"}
                    </button>
                    {createError && <div style={{ color: 'red', marginTop: 8 }}>{createError}</div>}
                </form>
                <div className="threads-list">
                    {loading && <p>Loading threads...</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {!loading && !error && threads.length > 0 ? (
                        threads.map((thread: any) => {
                            const repliesCount = posts.filter((post: any) => post.threadId === thread.threadId).length;
                            return (
                                <ThreadPreview
                                    boardName={boardName}
                                    key={thread.threadId}
                                    {...thread}
                                    replies={repliesCount < 0 ? 0 : repliesCount}
                                />
                            );
                        })
                    ) : (!loading && !error && <p>No threads yet for this board.</p>)}
                </div>
            </div>
        </>
    );
}else {return notFound()}
}

export function BoardImg({ boardName }: { boardName: string }) {
    const [imgSrc, setImgSrc] = useState(`/images/boards/${boardName}.png`);
    const [triedJpg, setTriedJpg] = useState(false);
    return (
        <>
            <Image
                    className="boardimg"
                    src={imgSrc}
                    alt="board"
                    width={1489}
                    height={450}
                    priority
                    style={{ objectFit: "cover", objectPosition: "top" }}
                    onError={() => {
                        if (!triedJpg) {
                            setImgSrc(`/images/boards/${boardName}.jpg`);
                            setTriedJpg(true);
                        } else {
                            setImgSrc("/images/logo.png");
                        }
                    }}
                />                
            <h1 className="boardname-top">{boardName}</h1>

        </>
    );
}