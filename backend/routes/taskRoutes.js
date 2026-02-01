const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

// All routes below require login
router.use(protect);

router.post('/', taskController.createTask);
router.get('/', taskController.getMyTasks);

// Example of an Admin-only route
router.delete('/:id', authorize('admin'), async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.status(204).json({ message: 'Deleted' });
});

module.exports = router;