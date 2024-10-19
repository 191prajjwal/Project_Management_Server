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




router.get("/editview/:taskId",authMiddleware,async(req,res)=>{

    try{
        const {taskId}=req.params
        const tasks= await Task.find({_id:taskId})
        res.status(200).json({tasks})
    }
    catch(err)
    {
        res.status(500).json({error:"Error fetching tasks"})
    }

})



router.put("/update/:taskId",authMiddleware,async(req,res)=>{

    try {
        
        const{taskId}=req.params
        const{title,priority,checklist,dueDate,userId}=req.body

        const task= await Task.findByIdAndUpdate({_id:taskId},{title,priority,checklist,dueDate,userId},{new:true})

        if(!task)
        {
            return res.status(404).json({success:false,message:"Task not found"})
        }

        res.status(200).json({success:true,message:"Task successfully updated",task:task})


    } catch (err) {
        res.status(500).json({error:"Error updating the task"})
    }


})


router.delete("/delete/:taskId",authMiddleware,async(req,res)=>{


    try{
        const{taskId}=req.params
        const task= await Task.findByIdAndDelete({_id:taskId})

        if(!task)
        {
            return res.status(404).json({success:false,message:"Task not found"})
        }

        res.status(200).json({success:true,message:"Task deleted successfully",task:task})
    }

    catch(err)
    {

       res.status(500) .json({error:"Error deleting the task"})
    }

})



router.post("/filter",authMiddleware,async(req,res)=>{

    try{
        const{userId,boardDate}=req.body

        let startDate,endDate

        if(boardDate==='today')
        {
            endDate= new Date()
            startDate= new Date(endDate)
            startDate.setHours(startDate.getHours()-24)
        }

        else if(boardDate==='thisWeek')
        {
            const today= new Date()
            const day= today.getDay()
            startDate= new Date(today)
            startDate.setDate(today.getDate()-day)
            endDate= new Date(startDate)
            endDate.setDate(startDate.getDate()+6)
        }

        else if(boardDate==="thisMonth")
        {
            const today= new Date()
            startDate= new Date(today.getFullYear(),today.getMonth(),1)
            endDate= new Date(today.getFullYear(),today.getMonth()+1,0)
        }


        const filter= await Task.find({userId,createdDate:{$gte:startDate,$lte:endDate}})

        res.status(200).json({filter})
    }
    catch(err)
    {
        res.status(500).json({error:"Error fetching the tasks"})
    }

})


router.post("/update/status",authMiddleware,async(req,res)=>{
    try{
        const {taskId,status}=req.body
        const task= await Task.findByIdAndUpdate(taskId,{status:status},{new:true})

        res.status(200).json({success:true,message:"status updated successfully", task:task})
    }
    catch(err)
    {
            res.status(500).json({error:"Error updating status"})
    }
})


router.post("/update/checklist",authMiddleware,async (req,res)=>{

    try {

        const {taskId,checklistItemId,isChecked}=req.body
        const task= await Task.findById(taskId)
        if(!task)
        {
            return res.status(404).json({success:false,error:"Task not found"})
        }

        const checklistItem= task.checklist.id(checklistItemId)

        if(!checklistItem)
        {
            return res.status(404).json({success:false,message:"checklist item not found"})
        }

        if((checklistItem.isChecked!==isChecked) && (typeof isChecked=== 'boolean'))
        {
            checklistItem.isChecked=isChecked
            await task.save()
        }

        res.status(200).json({success:true,message:"checklist item updated successfully",task})

        
    } catch (err) {
        res.status(500).json({success:false,error:"Error updating the checklist item"})
    }
})


module.exports= router