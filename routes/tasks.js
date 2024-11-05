const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Task = require("../schema/tasks.schema");

router.post("/add-task", authMiddleware, async (req, res) => {
    const { title, selectedPriority: priority, assignedTo: assignee, dueDate, checklist } = req.body;
    try {
        const newTask = new Task({
            title,
            priority,
            assignee,
            dueDate,
            checklist: checklist.map(item => ({
                name: item.name,
                completed: item.completed || false,
            })),
            creator: req.user.id,
        });
        await newTask.save();
        res.status(201).json({ message: "Task added successfully" });
    } catch (error) {
        console.error("Add Task Route: Error Adding Task:", error); 
        res.status(500).json({ error: "Failed to add task" });
    }
  });
  

router.get("/task-details", authMiddleware, async (req, res) => {
  try {
      const tasks = await Task.find({ creator: req.user.id });
      res.status(200).json(tasks);
  } catch (error) {
      console.error("Get Tasks Route: Error Getting Tasks:", error);
      res.status(500).json({ error: "Failed to get tasks" });
  }
});

// In your tasks router
router.patch("/update-status", authMiddleware, async (req, res) => {
    const { taskId, status } = req.body;
    console.log('Received request for task status update:', req.body);
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      task.status = status; // Update the status
      await task.save();
      res.status(200).json({ message: "Task status updated successfully" });
    } catch (error) {
      console.error("Error updating task status:", error);
      res.status(500).json({ error: "Failed to update task status" });
    }
  });
  

module.exports = router;
