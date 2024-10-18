const express = require("express")
const mongoose=require("mongoose")
const dotenv=require("dotenv")

const incommingReqLogger= require("./middlewares/logger")

dotenv.config()
const app = express()

const PORT= process.env.PORT || 4005

app.use(incommingReqLogger)


app.get("/",(req,res)=>{
    res.send("Working fine")
})


app.listen(PORT,()=>{
    console.log(`server is live at port ${PORT}`)
    mongoose.connect(process.env.MONGODB_URL).then(()=>{
        console.log("Database connected")
    }).catch((err)=>{
        console.log(err)
    })

})