const { Pool } = require('pg');

// Use environment variables for connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'crispy-lamp',
  password: process.env.PGPASSWORD || 'postgre',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

// Boards
async function getBoards() {
  const { rows } = await pool.query('SELECT * FROM boards ORDER BY id');
  return rows;
}

async function getBoardById(id) {
  const { rows } = await pool.query('SELECT * FROM boards WHERE id = $1', [id]);
  return rows[0] || null;
}

async function addBoard(board) {
  const { id, name, prefix, displayName } = board;
  await pool.query(
    'INSERT INTO boards (id, name, prefix, display_name) VALUES ($1, $2, $3, $4)',
    [id, name, prefix, displayName]
  );
  return true;
}

async function updateBoard(id, updates) {
  const { name, prefix, displayName } = updates;
  await pool.query(
    'UPDATE boards SET name = $1, prefix = $2, display_name = $3 WHERE id = $4',
    [name, prefix, displayName, id]
  );
  return true;
}

async function deleteBoard(id) {
  await pool.query('DELETE FROM boards WHERE id = $1', [id]);
  return true;
}

// Threads
async function getThreads(boardId) {
  if (boardId) {
    const { rows } = await pool.query('SELECT * FROM threads WHERE board_id = $1 ORDER BY created_at', [boardId]);
    return rows;
  } else {
    const { rows } = await pool.query('SELECT * FROM threads ORDER BY created_at');
    return rows;
  }
}

async function getThreadById(threadId) {
  const { rows } = await pool.query('SELECT * FROM threads WHERE thread_id = $1', [threadId]);
  return rows[0] || null;
}

async function addThread(thread) {
  const { threadId, boardId, content, imageUrl, imageAlt, opIp, createdAt } = thread;
  await pool.query(
    'INSERT INTO threads (thread_id, board_id, content, image_url, image_alt, op_ip, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [threadId, boardId, content, imageUrl, imageAlt, opIp, createdAt]
  );
  return true;
}

async function updateThread(threadId, updates) {
  const { content, imageUrl, imageAlt } = updates;
  await pool.query(
    'UPDATE threads SET content = $1, image_url = $2, image_alt = $3 WHERE thread_id = $4',
    [content, imageUrl, imageAlt, threadId]
  );
  return true;
}

async function deleteThread(threadId) {
  await pool.query('DELETE FROM threads WHERE thread_id = $1', [threadId]);
  return true;
}

// Posts
async function getPosts(threadId) {
  if (threadId) {
    const { rows } = await pool.query('SELECT * FROM posts WHERE thread_id = $1 ORDER BY created_at', [threadId]);
    return rows;
  } else {
    const { rows } = await pool.query('SELECT * FROM posts ORDER BY created_at');
    return rows;
  }
}

async function getPostById(id) {
  const { rows } = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
  return rows[0] || null;
}

async function addPost(post) {
  const { id, threadId, content, imageUrl, createdAt } = post;
  await pool.query(
    'INSERT INTO posts (id, thread_id, content, image_url, created_at) VALUES ($1, $2, $3, $4, $5)',
    [id, threadId, content, imageUrl, createdAt]
  );
  return true;
}

async function updatePost(id, updates) {
  const { content, imageUrl } = updates;
  await pool.query(
    'UPDATE posts SET content = $1, image_url = $2 WHERE id = $3',
    [content, imageUrl, id]
  );
  return true;
}

async function deletePost(id) {
  await pool.query('DELETE FROM posts WHERE id = $1', [id]);
  return true;
}

module.exports = {
  // Boards
  getBoards,
  getBoardById,
  addBoard,
  updateBoard,
  deleteBoard,
  // Threads
  getThreads,
  getThreadById,
  addThread,
  updateThread,
  deleteThread,
  // Posts
  getPosts,
  getPostById,
  addPost,
  updatePost,
  deletePost,
  // Pool (for advanced use/testing)
  pool,
}; 