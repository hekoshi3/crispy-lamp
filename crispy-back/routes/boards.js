const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Database = require('../utils/database');

const router = express.Router();

// GET all boards
router.get('/', async (req, res) => {
  try {
    const boards = await Database.getBoards();
    res.json({ boards });
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

// GET single board by ID
router.get('/:id', async (req, res) => {
  try {
    const boards = await Database.getBoards();
    const board = boards.find(b => b.id === req.params.id);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    res.json({ board });
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

// POST create new board
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Board name is required' });
    }
    
    const newBoard = {
      id: uuidv4(),
      name: name.trim()
    };
    
    const success = await Database.addBoard(newBoard);
    
    if (success) {
      res.status(201).json({ board: newBoard });
    } else {
      res.status(500).json({ error: 'Failed to create board' });
    }
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// PUT update board
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Board name is required' });
    }
    
    const success = await Database.updateBoard(req.params.id, { name: name.trim() });
    
    if (success) {
      const boards = await Database.getBoards();
      const updatedBoard = boards.find(b => b.id === req.params.id);
      res.json({ board: updatedBoard });
    } else {
      res.status(404).json({ error: 'Board not found' });
    }
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ error: 'Failed to update board' });
  }
});

// DELETE board
router.delete('/:id', async (req, res) => {
  try {
    const success = await Database.deleteBoard(req.params.id);
    
    if (success) {
      res.json({ message: 'Board deleted successfully' });
    } else {
      res.status(404).json({ error: 'Board not found' });
    }
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

module.exports = router; 