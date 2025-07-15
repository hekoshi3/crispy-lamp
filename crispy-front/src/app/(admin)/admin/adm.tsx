"use client"

import React, { useEffect, useState } from 'react';

interface Board {
  id: string;
  name: string;
}
interface Thread {
  threadId: string;
  content: string;
  createdAt?: string;
  imageUrl?: string;
}
interface Post {
  id: string;
  content: string;
  createdAt?: string;
  imageUrl?: string;
}

export default function AdminPanel() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [threads, setThreads] = useState<Record<string, Thread[]>>({});
  const [posts, setPosts] = useState<Record<string, Post[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const adminKey = localStorage.getItem("adminKey");


  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const boardsRes = await fetch('http://127.0.0.1:3001/api/boards');
      const boardsData = await boardsRes.json();
      setBoards(boardsData.boards || []);
      const threadsObj: Record<string, Thread[]> = {};
      const postsObj: Record<string, Post[]> = {};
      for (const board of boardsData.boards || []) {
        const threadsRes = await fetch(`http://127.0.0.1:3001/api/threads?boardId=${board.id}`);
        const threadsData = await threadsRes.json();
        threadsObj[board.id] = threadsData.threads || [];
        for (const thread of threadsData.threads || []) {
          const postsRes = await fetch(`http://127.0.0.1:3001/api/posts?threadId=${thread.threadId}`);
          const postsData = await postsRes.json();
          postsObj[thread.threadId] = postsData.posts || [];
        }
      }
      setThreads(threadsObj);
      setPosts(postsObj);
    } catch (err) {
      setError('Failed to load moderation data: '+err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDeleteThread(threadId: string) {
    if (!window.confirm('Delete this thread and all its posts?')) return;
    setActionLoading(`thread-${threadId}`);
    try {
      await fetch(`http://127.0.0.1:3001/api/threads/${threadId}`, { method: 'DELETE', headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey || "",
      }, });
      await fetchAll();
    } catch (err) {
      alert('Failed to delete thread: '+err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeletePost(postId: string) {
    if (!window.confirm('Delete this post?')) return;
    setActionLoading(`post-${postId}`);
    try {
      await fetch(`http://127.0.0.1:3001/api/posts/${postId}`, { method: 'DELETE', headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey || "",
      }, });
      await fetchAll();
    } catch (err) {
      alert('Failed to delete post: '+err);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Admin Panel</h1>
      <h2>Moderation Overview</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <div style={{ color: 'white' }}>
          {boards.map(board => (
            <div key={board.id} style={{ marginBottom: 32, border: '1px solid #444', borderRadius: 8, padding: 16 }}>
              <h3>Board: {board.name} (ID: {board.id})</h3>
              {threads[board.id] && threads[board.id].length > 0 ? (
                <ul>
                  {threads[board.id].map(thread => (
                    <li key={thread.threadId} style={{ marginBottom: 12 }}>
                      <strong>Thread #{thread.threadId}</strong>: {thread.content}
                      {thread.createdAt && <span style={{ marginLeft: 8, color: '#888' }}>{thread.createdAt}</span>}
                      {thread.imageUrl && (
                        <span style={{ marginLeft: 8 }}>
                          <a href={thread.imageUrl} target="_blank" rel="noopener noreferrer">[image]</a>
                        </span>
                      )}
                      <button
                        style={{ marginLeft: 8, color: 'white', background: '#c00', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
                        onClick={() => handleDeleteThread(thread.threadId)}
                        disabled={actionLoading === `thread-${thread.threadId}`}
                      >
                        {actionLoading === `thread-${thread.threadId}` ? 'Deleting...' : 'Delete Thread'}
                      </button>
                      {posts[thread.threadId] && posts[thread.threadId].length > 0 ? (
                        <ul style={{ marginTop: 4 }}>
                          {posts[thread.threadId].map(post => (
                            <li key={post.id} style={{ fontSize: '0.95em', marginBottom: 4 }}>
                              <span>Post #{post.id}: {post.content}</span>
                              {post.createdAt && <span style={{ marginLeft: 8, color: '#aaa' }}>{post.createdAt}</span>}
                              {post.imageUrl && (
                                <span style={{ marginLeft: 8 }}>
                                  <a href={post.imageUrl} target="_blank" rel="noopener noreferrer">[image]</a>
                                </span>
                              )}
                              <button
                                style={{ marginLeft: 8, color: 'white', background: '#c00', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
                                onClick={() => handleDeletePost(post.id)}
                                disabled={actionLoading === `post-${post.id}`}
                              >
                                {actionLoading === `post-${post.id}` ? 'Deleting...' : 'Delete Post'}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div style={{ color: '#aaa', marginLeft: 12 }}>No posts</div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ color: '#aaa', marginLeft: 12 }}>No threads</div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
} 