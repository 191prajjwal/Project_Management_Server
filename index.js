const express = require("express")
const mongoose=require("mongoose")
const dotenv=require("dotenv")

const userRoutes= require("./routes/userRoutes")

dotenv.config()
const app = express()
const PORT= process.env.PORT || 4005

const incommingReqLogger= require("./middlewares/logger")
app.use(express.json())

app.use(incommingReqLogger)


app.get("/",(req,res)=>{
    res.send("Working fine")
})

app.use("/api/v1/users",userRoutes)


app.listen(PORT,()=>{
    console.log(`server is live at port ${PORT}`)
    mongoose.connect(process.env.MONGODB_URL).then(()=>{
        console.log("Database connected")
    }).catch((err)=>{
        console.log(err)
    })

})