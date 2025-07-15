"use client";

import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import "../../../../css/thread.css";
import { BoardImg } from "../../../components/BoardImg";


type Thread = {
    threadId: string;
    opIp: string;
    content: string;
    imageUrl?: string | null;
    imageAlt?: string | null;
    createdAt?: string;
};

type Post = {
    id: string;
    threadId: string;
    content: string;
    imageUrl?: string | null;
    createdAt?: string;
};

export default function Page({ params }: { params: Promise<{ boardName: string; threadId: string }> }) {
    const paramsObj = React.use(params);
    const { boardName, threadId } = paramsObj;
    const [thread, setThread] = useState<Thread | null>(null);
    const [replies, setReplies] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Post creation state
    const [postContent, setPostContent] = useState("");
    const [postImage, setPostImage] = useState<File | null>(null);
    const [postImageAlt, setPostImageAlt] = useState("");
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState<string | null>(null);
    const postFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        // Fetch thread
        fetch(`http://127.0.0.1:3001/api/threads/${threadId}`)
            .then(res => res.json())
            .then(data => {
                if (data.thread) {
                    setThread(data.thread);
                    // Fetch replies for this thread
                    return fetch(`http://127.0.0.1:3001/api/posts?threadId=${threadId}`);
                } else {
                    setError("Thread not found");
                    setLoading(false);
                    return null;
                }
            })
            .then(res => res ? res.json() : null)
            .then(data => {
                if (data && data.posts) {
                    setReplies(data.posts);
                }
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load thread data");
                setLoading(false);
            });
    }, [threadId]);

    // Post creation handler
    async function handleCreatePost(e: React.FormEvent) {
        e.preventDefault();
        setPosting(true);
        setPostError(null);
        let uploadedImageUrl = null;
        try {
            if (!postContent.trim()) {
                setPostError("Content is required");
                setPosting(false);
                return;
            }
            // Upload image if present
            if (postImage) {
                const formData = new FormData();
                formData.append("image", postImage);
                const uploadRes = await fetch("http://127.0.0.1:3001/api/upload/image", {
                    method: "POST",
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (!uploadData.success) {
                    setPostError(uploadData.error || "Image upload failed");
                    setPosting(false);
                    return;
                }
                uploadedImageUrl = `http://127.0.0.1:3001${uploadData.imageUrl}`;
            }
            // Create post
            const postRes = await fetch("http://127.0.0.1:3001/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    threadId,
                    content: postContent.trim(),
                    imageUrl: uploadedImageUrl,
                    imageAlt: postImageAlt.trim() || undefined
                })
            });
            const postData = await postRes.json();
            if (!postRes.ok) {
                setPostError(postData.error || "Failed to create post");
                setPosting(false);
                return;
            }
            // Reset form
            setPostContent("");
            setPostImage(null);
            setPostImageAlt("");
            if (postFileInputRef.current) postFileInputRef.current.value = "";
            // Refresh replies
            setReplies((prev) => [...prev, postData.post]);
        } catch (err) {
            setPostError("Failed to create post: "+err);
        } finally {
            setPosting(false);
        }
    }

    if (loading) {
        return <div className="thread"><p></p></div>;
    }
    if (error) {
        return <div className="thread"><p style={{color: 'red'}}>{error}</p></div>;
    }
    if (!thread) {
        return <div className="thread"><p>Thread not found.</p></div>;
    }

    return (
        <>
            <title>{threadId}</title>
            <BoardImg boardName={boardName}></BoardImg>
            <div className="thread-flex-container">
                <div className="thread-main-content">
                    <div className="thread-op thread-reply">
                        {thread.imageUrl && (
                            <div className="thread-image-container">
                                <a href={thread.imageUrl} target="_blank" rel="noopener noreferrer">
                                    <Image
                                        src={`/api/proxy-image?imageName=${thread.imageUrl.split('/').pop()}`}
                                        alt={thread.imageAlt || "OP image"}
                                        width={200}
                                        height={150}
                                        className="thread-image"
                                        style={{ objectFit: "cover", maxWidth: "100%" }}
                                    />
                                </a>
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <div className="thread-id">#{thread.threadId}</div>
                            <div className="thread-content">{thread.content}</div>
                        </div>
                    </div>
                    {/* Replies */}
                    <div className="thread-replies">
                        {replies.map((msg) => (
                            <div className="thread-reply" key={msg.id}>
                                {msg.imageUrl && (
                                    <div className="thread-image-container">
                                        <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                                            <Image
                                                src={`/api/proxy-image?imageName=${msg.imageUrl.split('/').pop()}`}
                                                alt="Reply image"
                                                width={200}
                                                height={150}
                                                className="thread-image"
                                                style={{ objectFit: "cover", maxWidth: "100%" }}
                                            />
                                        </a>
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <div className="thread-id">#{msg.id}</div>
                                    <div className="thread-content">{msg.content}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <form className="thread-sticky-form" onSubmit={handleCreatePost}>
                    <h2>Reply to thread</h2>
                    <textarea
                        value={postContent}
                        onChange={e => setPostContent(e.target.value)}
                        placeholder="Reply content..."
                        rows={3}
                        style={{ width: '100%', marginBottom: 8 }}
                        required
                    />
                    <br />
                    <input
                        type="file"
                        accept="image/*"
                        ref={postFileInputRef}
                        onChange={e => setPostImage(e.target.files?.[0] || null)}
                        style={{ marginBottom: 8 }}
                    />
                    {/*<br />
                    <input
                        type="text"
                        value={postImageAlt}
                        onChange={e => setPostImageAlt(e.target.value)}
                        placeholder="Image alt text (optional)"
                        style={{ width: '100%', marginBottom: 8 }}
                    />*/}
                    <button type="submit" disabled={posting} style={{ padding: '8px 16px' }}>
                        {posting ? "Posting..." : "Post Reply"}
                    </button>
                    {postError && <div style={{ color: 'red', marginTop: 8 }}>{postError}</div>}
                </form>
            </div>
        </>
    );
}
