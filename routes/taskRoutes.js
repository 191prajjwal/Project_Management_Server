const express= require("express")
const router= express.Router()
const Task = require("../models/taskModel")
const authMiddleware= require("../middlewares/auth")





router.post("/create",authMiddleware,async (req,res)=>{

    try {
        const {title,priority,checklist,dueDate,status,userId}= req.body

    const task= new Task({title,priority,checklist,dueDate,status,userId})

    await task.save()

    res.status(201).json({success:true,message:"Task successfully created",task:task})
    } 
    catch (err) {

        console.log(err)
        res.status(500).json({error:'Error creating task'})
        
    }
})



module.exports= router