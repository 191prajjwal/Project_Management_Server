const express = require("express");
const router = express.Router();
const Task = require("../models/taskModel");
const User= require("../models/userModel")
const authMiddleware = require("../middlewares/auth");

router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { title, priority, checklist, dueDate, board, userId,assignTo } = req.body;


    const newTask = new Task({
      title,
      priority,
      checklist,
      dueDate,
      board,
      userId
    });

    await newTask.save();

    res
      .status(201)
      .json({
        success: true,
        message: "Task successfully created",
        task: newTask,
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error creating task" });
  }
});

router.get("/editview/:taskId", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const tasks = await Task.find({ _id: taskId });
    res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ error: "Error fetching tasks" });
  }
});

router.get("/publicview/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const tasks = await Task.find({ _id: taskId });
    res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ error: "Error fetching tasks" });
  }
});



// router.put("/update/:taskId", authMiddleware, async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const { title, priority, checklist, dueDate, userId, assignTo } = req.body; 

//     const updatedTask = await Task.findByIdAndUpdate(
//       { _id: taskId },
//       { title, priority, checklist, dueDate, userId, assignTo }, 
//       { new: true }
//     );

//     if (!updatedTask) {
//       return res.status(404).json({ success: false, error: "Task not found" });
//     }

//     res
//       .status(200)
//       .json({
//         success: true,
//         message: "Task successfully updated",
//         task: updatedTask,
//       });
//   } catch (err) {
//     res.status(500).json({ error: "Error updating the task" });
//   }
// });


router.put("/update/:taskId", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, priority, checklist, dueDate, board, assignTo } = req.body;
    
    // Find the task without modifying ownership (userId)
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    // Update task fields, but not userId
    task.title = title || task.title;
    task.priority = priority || task.priority;
    task.checklist = checklist || task.checklist;
    task.dueDate = dueDate || task.dueDate;
    task.board = board || task.board;
    task.assignTo = assignTo || task.assignTo;

    await task.save();
    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({ error: "Error updating the task" });
  }
});



router.delete("/delete/:taskId", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const deletedTask = await Task.findByIdAndDelete({ _id: taskId });

    if (!deletedTask) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Task deleted successfully",
        task: deletedTask,
      });
  } catch (err) {
    res.status(500).json({ error: "Error deleting the task" });
  }
});




router.post("/filter", authMiddleware, async (req, res) => {
  try {
    const { userId, boardDate } = req.body;

    let startDate, endDate;

    if (boardDate === "today") {
      endDate = new Date();
      startDate = new Date(endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (boardDate === "thisWeek") {
      const today = new Date();
      const dayOfWeek = today.getDay();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (boardDate === "thisMonth") {
      const today = new Date();
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

  

    let tasksToDo;
    if (startDate && endDate) {
      tasksToDo = await Task.find({
        $or: [
          {
            userId,
            $or: [
              { dueDate: { $gte: startDate, $lte: endDate } },
              { dueDate: null }
            ]
          },
          {
            assignTo: userId,
            $or: [
              { dueDate: { $gte: startDate, $lte: endDate } },
              { dueDate: null }
            ]
          }
        ]
      });
    } else {
      tasksToDo = await Task.find({
        $or: [
          { userId },
          { assignTo: userId }
        ]
      });
    }

   
    const assignedUserIds = tasksToDo.map(task => task.assignTo).filter(Boolean); 
    const assignedUsers = await User.find({ _id: { $in: assignedUserIds } }); 
    const assignedUsersMap = {};

    assignedUsers.forEach(user => {
      assignedUsersMap[user._id] = user.name; 
    });

  
    tasksToDo = tasksToDo.map(task => {
      const assignedUserName = assignedUsersMap[task.assignTo] || "";

      return {
        ...task.toObject(), 
        assignedUserName 
      };
    });


    res.status(200).json({ tasksToDo }); 
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Error retrieving tasks" });
  }
});








router.post("/update/board", authMiddleware, async (req, res) => {
  try {
    const { taskId, newBoard } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { board: newBoard },
      { new: true }
    );

    res
      .status(200)
      .json({
        success: true,
        message: "Board updated successfully",
        task: updatedTask,
      });
  } catch (err) {
    res.status(500).json({ error: "Error updating board" });
  }
});

router.post("/update/checklist", authMiddleware, async (req, res) => {
  try {
    const { taskId, checklistItemId, completed } = req.body;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    const checklistItem = task.checklist.id(checklistItemId);

    if (!checklistItem) {
      return res
        .status(404)
        .json({ success: false, message: "checklist item not found" });
    }

    if (
      checklistItem.completed !== completed &&
      typeof completed === "boolean"
    ) {
      checklistItem.completed = completed;
      await task.save();
    }

    res
      .status(200)
      .json({
        success: true,
        message: "checklist item updated successfully",
        task,
      });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: "Error updating the checklist item" });
  }
});

module.exports = router;
