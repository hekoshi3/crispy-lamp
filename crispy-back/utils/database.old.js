const fs = require('fs-extra');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
fs.ensureDirSync(dataDir);

// Initialize database if it doesn't exist
if (!fs.existsSync(dbPath)) {
  const initialData = {
    boards: [],
    threads: [],
    posts: []
  };
  fs.writeJsonSync(dbPath, initialData, { spaces: 2 });
}

class Database {
  static async read() {
    try {
      return await fs.readJson(dbPath);
    } catch (error) {
      console.error('Error reading database:', error);
      return { boards: [], threads: [], posts: [] };
    }
  }

  static async write(data) {
    try {
      await fs.writeJson(dbPath, data, { spaces: 2 });
      return true;
    } catch (error) {
      console.error('Error writing database:', error);
      return false;
    }
  }

  static async getBoards() {
    const data = await this.read();
    return data.boards || [];
  }

  static async getThreads() {
    const data = await this.read();
    return data.threads || [];
  }

  static async getPosts() {
    const data = await this.read();
    return data.posts || [];
  }

  static async addBoard(board) {
    const data = await this.read();
    data.boards.push(board);
    return await this.write(data);
  }

  static async addThread(thread) {
    const data = await this.read();
    data.threads.push(thread);
    return await this.write(data);
  }

  static async addPost(post) {
    const data = await this.read();
    data.posts.push(post);
    return await this.write(data);
  }

  static async updateBoard(boardId, updates) {
    const data = await this.read();
    const boardIndex = data.boards.findIndex(board => board.id === boardId);
    if (boardIndex !== -1) {
      data.boards[boardIndex] = { ...data.boards[boardIndex], ...updates };
      return await this.write(data);
    }
    return false;
  }

  static async updateThread(threadId, updates) {
    const data = await this.read();
    const threadIndex = data.threads.findIndex(thread => thread.threadId === threadId);
    if (threadIndex !== -1) {
      data.threads[threadIndex] = { ...data.threads[threadIndex], ...updates };
      return await this.write(data);
    }
    return false;
  }

  static async updatePost(postId, updates) {
    const data = await this.read();
    const postIndex = data.posts.findIndex(post => post.id === postId);
    if (postIndex !== -1) {
      data.posts[postIndex] = { ...data.posts[postIndex], ...updates };
      return await this.write(data);
    }
    return false;
  }

  static async deleteBoard(boardId) {
    const data = await this.read();
    data.boards = data.boards.filter(board => board.id !== boardId);
    // Also delete related threads and posts
    data.threads = data.threads.filter(thread => thread.boardId !== boardId);
    const threadIds = data.threads.map(thread => thread.threadId);
    data.posts = data.posts.filter(post => threadIds.includes(post.threadId));
    return await this.write(data);
  }

  static async deleteThread(threadId) {
    const data = await this.read();
    data.threads = data.threads.filter(thread => thread.threadId !== threadId);
    data.posts = data.posts.filter(post => post.threadId !== threadId);
    return await this.write(data);
  }

  static async deletePost(postId) {
    const data = await this.read();
    data.posts = data.posts.filter(post => post.id !== postId);
    return await this.write(data);
  }
}

module.exports = Database; 