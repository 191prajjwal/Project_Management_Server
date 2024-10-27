const mongoose= require("mongoose")

const taskSchema= new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    priority:{
        type:String,
        enum:["LOW PRIORITY","MODERATE PRIORITY","HIGH PRIORITY"],
        required:true
    },
    checklist:[{
        taskName:String,
        completed:{
            type:Boolean,
            default:false
        }
    }],
    dueDate:{
        type:Date
    },
    board:{
        type:String,
        enum:["toDo","inProgress","backlog","done"],
        required:true
    },
    userId:{
        type:String,
        required:true
    },
    createdDate:{
        type:Date,
        default:Date.now,
        required:true
    },
    assignTo:{
        type:String,
        required:false
    },
})


const Task= mongoose.model("Task",taskSchema)
module.exports=Task