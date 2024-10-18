const express= require("express")
const router = express.Router()
const User= require("../models/userModel")
const isValidEmail= require("../utils/helper")
const bcrypt= require("bcrypt")
const jwt= require("jsonwebtoken")
const authMiddleware= require("../middlewares/auth")


router.post("/register",async(req,res)=>{

    try{
        const{name,email,password,confirmPassword}=req.body;



        if(!name || !email || !password || !confirmPassword)
        {

            return res.status(400).json({
               success:false, 
               status:400,
               message:"All fields are necessary." 
            })
        }

        if(password.length<8 || confirmPassword!==password)
        {
            return res.status(400).json({
                message:"Password must be atleast 8 characters long and should match to confirm password field "
            })
        }

        if(!isValidEmail(email))
        {
            return res.status(400).json({success:false,message:"Invalid email address"})
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success:false,message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const user = new User({
            name,
            email,
            password: hashedPassword 
        });

            await user.save()
            res.status(201).json({success:true,message:"User successfully registered"})
    }

catch(err){

    res.status(500).json({success:false,message:"Registration unsuccessful", error:err.message})

}

})


router.post("/login",async(req,res)=>{

    try{

        const {email,password}= req.body
        const user= await User.findOne({email})

        if(!user){

          return res.status(404).json({success:false, message:"Invalid email or password"})
        }

        const isPasswordTrue= await bcrypt.compare(password,user.password)

        // console.log(isPasswordTrue)

        if(!isPasswordTrue)
        {
          return res.status(401).json({success:false,message:"Invalid email or password"})
        }

        const token = jwt.sign({userId:user._id.toString()},process.env.JWT_SECRET_KEY)

        return res.status(200).json({success:true,message:"Login successful",token,userId:user._id.toString(),name:user.name})


    }


    catch(err)
    {    console.log(err)
        res.status(500).json({message:"Login unsuccessful",error:err.message})
    }

})





module.exports= router