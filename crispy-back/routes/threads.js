const express = require('express');
const Database = require('../utils/database');
const logger = require('../utils/logger');
const adminAuth = require('../middleware/auth');

const router = express.Router();

// GET all threads
router.get('/', async (req, res) => {
  try {
    const { boardId } = req.query;
    console.log('GET /api/threads called with boardId:', boardId);
    const threads = await Database.getThreads(boardId);
    //console.log('DB returned threads:', threads);

    // Map snake_case to camelCase
    const mappedThreads = threads.map(t => ({
      threadId: t.thread_id,
      boardId: t.board_id,
      content: t.content,
      imageUrl: t.image_url,
      imageAlt: t.image_alt,
      opIp: t.op_ip,
      createdAt: t.created_at,
    }));

    res.json({ threads: mappedThreads });
  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
});

// GET single thread by ID
router.get('/:id', async (req, res) => {
  try {
    const thread = await Database.getThreadById(req.params.id);

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Map snake_case to camelCase
    const mappedThread = {
      threadId: thread.thread_id,
      boardId: thread.board_id,
      content: thread.content,
      imageUrl: thread.image_url,
      imageAlt: thread.image_alt,
      opIp: thread.op_ip,
      createdAt: thread.created_at,
    };

    res.json({ thread: mappedThread });
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ error: 'Failed to fetch thread' });
  }
});

// POST create new thread
router.post('/', async (req, res) => {
  try {
    const { boardId, content, imageUrl, imageAlt, opIp } = req.body;
    
    if (!boardId || !content || content.trim() === '') {
      return res.status(400).json({ error: 'Board ID and content are required' });
    }
    
    // Find board for thread
    const boards = await Database.getBoards();
    const board = boards.find(b => b.id === boardId);
    if (!board) {
      return res.status(400).json({ error: 'Board not found' });
    }
    const prefix = boardId.slice(0, 1); // or use board.prefix if you have it

    // Find the max threadId for this board
    const { rows } = await Database.pool.query(
      'SELECT MAX(CAST(thread_id AS BIGINT)) AS max_id FROM threads WHERE board_id = $1',
      [boardId]
    );
    let nextThreadId;
    if (rows[0].max_id) {
      nextThreadId = (BigInt(rows[0].max_id) + 1n).toString();
    } else {
      nextThreadId = (BigInt(boardId) + 1n).toString();
    }
    
    const newThread = {
      threadId: String(nextThreadId),
      boardId,
      content: content.trim(),
      imageUrl: imageUrl || null,
      imageAlt: imageAlt || null,
      opIp: opIp || 'anonymous',
      createdAt: new Date().toISOString()
    };
    
    const success = await Database.addThread(newThread);
    
    if (success) {
      res.status(201).json({ thread: newThread });
    } else {
      res.status(500).json({ error: 'Failed to create thread' });
    }
  } catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

// PUT update thread
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { content, imageUrl, imageAlt } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const updates = {
      content: content.trim(),
      imageUrl: imageUrl || null,
      imageAlt: imageAlt || null
    };
    
    const success = await Database.updateThread(req.params.id, updates);
    
    if (success) {
      const threads = await Database.getThreads();
      const updatedThread = threads.find(t => t.threadId === req.params.id);
      res.json({ thread: updatedThread });
    } else {
      res.status(404).json({ error: 'Thread not found' });
    }
  } catch (error) {
    console.error('Error updating thread:', error);
    res.status(500).json({ error: 'Failed to update thread' });
  }
});

// DELETE thread
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const success = await Database.deleteThread(req.params.id);
    
    if (success) {
      logger.logModeration('DELETE_THREAD', `ThreadId: ${req.params.id}`);
      res.json({ message: 'Thread deleted successfully' });
    } else {
      res.status(404).json({ error: 'Thread not found' });
    }
  } catch (error) {
    console.error('Error deleting thread:', error);
    res.status(500).json({ error: 'Failed to delete thread' });
  }
});

module.exports = router; 