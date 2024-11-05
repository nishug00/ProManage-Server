const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Task = require("../schema/tasks.schema");
const mongoose = require("mongoose");

router.post("/add-task", authMiddleware, async (req, res) => {
  const {
    title,
    selectedPriority: priority,
    assignedTo: assignee,
    dueDate,
    checklist,
  } = req.body;
  try {
    const newTask = new Task({
      title,
      priority,
      assignee,
      dueDate,
      checklist: checklist.map((item) => ({
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

router.delete("/delete-task/:taskId", authMiddleware, async (req, res) => { 
    const { taskId } = req.params;
    console.log(`DELETE request received for task ID: ${taskId}`);
    
    // Check if the taskId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      console.warn(`Invalid task ID format: ${taskId}`);
      return res.status(400).json({ error: "Invalid task ID format" });
    }
  
    try {
      const deletedTask = await Task.findByIdAndDelete(taskId);
      console.log("Deleted task details:", deletedTask);
      if (!deletedTask) {
        console.warn(`Task not found for ID: ${taskId}`);
        return res.status(404).json({ error: "Task not found" });
      }
      console.log(`Task deleted successfully: ${taskId}`);
      res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error in delete task route:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
});

  
router.get("/task-details", authMiddleware, async (req, res) => {
  try {
    // Fetch tasks where the user is either the creator or the assignee
    const tasks = await Task.find({
      $or: [
        { creator: req.user.id }, // Tasks created by the user
        { assignee: req.user.id }, // Tasks assigned to the user
      ],
    }).populate("assignee creator"); // Optional: populate for more user details

    res.status(200).json(tasks); // Respond with the found tasks
  } catch (error) {
    console.error("Get Tasks Route: Error Getting Tasks:", error);
    res.status(500).json({ error: "Failed to get tasks" });
  }
});

// In your tasks router
router.patch("/update-status", authMiddleware, async (req, res) => {
  const { taskId, status } = req.body;
  console.log("Received request for task status update:", req.body);
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

router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;


    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID." });
    }

    const tasks = await Task.find({ assignee: userId }).populate(
      "assignee",
      "username email"
    );

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tasks." });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId).populate('assignee creator'); // Populate references to User model

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error("Error fetching task by ID:", error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
