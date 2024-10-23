const express= require("express")
const router= express.Router()
const Task= require("../models/taskModel")
const authMiddleware = require("../middlewares/auth")



async function taskAnalytics (userId){

    try{

        const todoTasks= await Task.countDocuments({userId,status:"toDo"})

        const inProgressTasks= await Task.countDocuments({userId,status:"inProgress"})

        const backlogTasks= await Task.countDocuments({userId,status:"backlog"})

        const doneTasks= await Task.countDocuments({userId,status:"done"})



        const lowPriorityTasks= await Task.countDocuments({userId,priority:"LOW PRIORITY"})

        const highPriorityTasks= await Task.countDocuments({userId,priority:"HIGH PRIORITY"})

        const moderatePriorityTasks= await Task.countDocuments({userId,priority:"MODERATE PRIORITY"})


        const dueDateTasks= await Task.countDocuments({userId, dueDate:{$ne:null,$lte:new Date()}})

        const anayticsData={
            todoTasks,
            inProgressTasks,
            backlogTasks,
            doneTasks,
            lowPriorityTasks,
            highPriorityTasks,
            moderatePriorityTasks,
            dueDateTasks
        }

        return anayticsData


    }
    catch(err)
    {
        console.log("error occured",err)
        
        throw new Error("Error fetching analytics data")

    }

}


router.get("/analytics/:userId",authMiddleware,async (req,res)=>{

    const {userId}= req.params
    try{
        const userData= await taskAnalytics(userId)
        res.status(200).json(userData)
    }
    catch(error)
    {
        res.status(500).json({success:false,error:"Error fetching analytics data"})
    }

    
})

module.exports = router