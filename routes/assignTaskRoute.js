
const express= require("express")
const authMiddleware=require("../middlewares/auth")
const router= express.Router()
const Task= require("../models/taskModel")

router.post("/tasks", authMiddleware, async (req, res) => {
 
    try {
      const { userId, assignId } = req.body;
      const tasks = await Task.find({ userId });
      if (tasks.length === 0) {
        return res.status(404).json({ message: "No tasks found for the specified userId." });
      }

      await Task.updateMany(
        { userId }, 
        { $set: { assignTo: assignId } } 
      );
      res.status(200).json({ message: "Tasks successfully assigned.", tasksAssigned: tasks.length });
    } catch (error) {
      res.status(500).json({ error: "Error assigning tasks to user." });
    }
  });
   

module.exports= router