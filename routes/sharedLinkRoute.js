const express = require("express")
const router= express.Router()

const Task= require("../models/taskModel")

async function linkGenerator(taskId){
    const URL= process.env.FRONTEND_URL
    

    try{
        const task= await Task.findById({_id:taskId})

        if(!task)
        {
            throw new Error("Task not found")
        }


        const shareableLink= `${URL}/public/sharedtasklink/${task._id}`

        return shareableLink
    }

    catch(err)
    {
        throw new Error("Error generating shared link")
    }
}


router.get("/sharelink/:taskid",async(req,res)=>{
   try {
    
    const {taskId}= req.params
    const shareableLink= await linkGenerator(taskId)
    res.status(200).json({shareableLink})

   }
    catch (err) {

        console.log(err)
        res.status(500).json({success:false,error:"Error generating shared link"})
    
   }
})


module.exports= router