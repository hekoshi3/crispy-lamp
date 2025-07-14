const express = require('express');
const Database = require('../utils/database');

const router = express.Router();

// GET all posts
router.get('/', async (req, res) => {
  try {
    const { threadId } = req.query;
    let posts = await Database.getPosts();
    
    if (threadId) {
      posts = posts.filter(post => post.threadId === threadId);
    }
    
    res.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET single post by ID
router.get('/:id', async (req, res) => {
  try {
    const posts = await Database.getPosts();
    const post = posts.find(p => p.id === req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// POST create new post
router.post('/', async (req, res) => {
  try {
    const { threadId, content, imageUrl } = req.body;
    
    if (!threadId || !content || content.trim() === '') {
      return res.status(400).json({ error: 'Thread ID and content are required' });
    }
    
    // Verify thread exists
    const threads = await Database.getThreads();
    const thread = threads.find(t => t.threadId === threadId);
    if (!thread) {
      return res.status(400).json({ error: 'Thread not found' });
    }
    // Find board for thread
    const boards = await Database.getBoards();
    const board = boards.find(b => b.id === thread.boardId);
    if (!board) {
      return res.status(400).json({ error: 'Board not found for thread' });
    }
    const prefix = board.prefix;
    if (!prefix) {
      return res.status(400).json({ error: 'Board prefix not set' });
    }
    // Generate post ID: prefixXXXXXX
    const posts = await Database.getPosts();
    let maxId = prefix * 1000000;
    posts.forEach(p => {
      const idNum = parseInt(p.id, 10);
      if (!isNaN(idNum) && Math.floor(idNum / 1000000) === prefix && idNum > maxId) {
        maxId = idNum;
      }
    });
    const nextPostId = (maxId < (prefix + 1) * 1000000 - 1) ? (maxId + 1) : (prefix * 1000000 + 1);
    
    const newPost = {
      id: String(nextPostId),
      threadId,
      content: content.trim(),
      imageUrl: imageUrl || null,
      createdAt: new Date().toISOString()
    };
    
    const success = await Database.addPost(newPost);
    
    if (success) {
      res.status(201).json({ post: newPost });
    } else {
      res.status(500).json({ error: 'Failed to create post' });
    }
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT update post
router.put('/:id', async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const updates = {
      content: content.trim(),
      imageUrl: imageUrl || null
    };
    
    const success = await Database.updatePost(req.params.id, updates);
    
    if (success) {
      const posts = await Database.getPosts();
      const updatedPost = posts.find(p => p.id === req.params.id);
      res.json({ post: updatedPost });
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE post
router.delete('/:id', async (req, res) => {
  try {
    const success = await Database.deletePost(req.params.id);
    
    if (success) {
      res.json({ message: 'Post deleted successfully' });
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router; 