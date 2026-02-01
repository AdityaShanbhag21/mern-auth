const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      owner: req.user.id // Taken from the JWT payload
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    // If admin, they might want to see all (logic can be added), 
    // but here we filter by owner for security.
    const tasks = await Task.find({ owner: req.user.id });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};