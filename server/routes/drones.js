const express = require('express');
const router = express.Router();

// Placeholder routes - will be implemented in later tasks
router.get('/', (req, res) => {
  res.status(501).json({ 
    success: false, 
    message: 'Drone listing endpoint not implemented yet' 
  });
});

router.get('/:id', (req, res) => {
  res.status(501).json({ 
    success: false, 
    message: 'Drone details endpoint not implemented yet' 
  });
});

router.post('/', (req, res) => {
  res.status(501).json({ 
    success: false, 
    message: 'Create drone endpoint not implemented yet' 
  });
});

module.exports = router;