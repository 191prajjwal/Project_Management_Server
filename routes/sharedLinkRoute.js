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


        const sharedLink= `${URL}/public/sharedtasklink/${task._id}`

        return sharedLink
    }

    catch(err)
    {
        throw new Error("Error generating shared link")
    }
}


router.get("/sharelink/:taskid",async(req,res)=>{
   try {
    
    const {taskId}= req.params
    const sharedLink= await linkGenerator(taskId)
    res.status(200).json({sharedLink})

   }
    catch (err) {

        console.log(err)
        res.status(500).json({success:false,message:"Error generating shared link"})
    
   }
})


module.exports= router