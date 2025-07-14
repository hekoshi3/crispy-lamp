const express = require('express');
const Database = require('../utils/database');

const router = express.Router();

// GET all threads
router.get('/', async (req, res) => {
  try {
    const { boardId } = req.query;
    let threads = await Database.getThreads();
    
    if (boardId) {
      threads = threads.filter(thread => thread.boardId === boardId);
    }
    
    res.json({ threads });
  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
});

// GET single thread by ID
router.get('/:id', async (req, res) => {
  try {
    const threads = await Database.getThreads();
    const thread = threads.find(t => t.threadId === req.params.id);
    
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    res.json({ thread });
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
    const prefix = board.prefix;
    if (!prefix) {
      return res.status(400).json({ error: 'Board prefix not set' });
    }

    // Generate threadId in range prefix000001–prefix999999
    const threads = await Database.getThreads();
    let maxId = prefix * 1000000;
    threads.forEach(t => {
      const idNum = parseInt(t.threadId, 10);
      if (!isNaN(idNum) && Math.floor(idNum / 1000000) === prefix && idNum > maxId) {
        maxId = idNum;
      }
    });
    const nextThreadId = (maxId < (prefix + 1) * 1000000 - 1) ? (maxId + 1) : (prefix * 1000000 + 1);
    
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
  try {
    const success = await Database.deleteThread(req.params.id);
    
    if (success) {
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