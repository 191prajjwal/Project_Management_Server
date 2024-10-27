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

      

        if(!isPasswordTrue)
        {
          return res.status(401).json({success:false,message:"Invalid email or password"})
        }

        const token = jwt.sign({userId:user._id.toString()},process.env.JWT_SECRET_KEY)

        return res.status(200).json({success:true,message:"Login successful",token,userId:user._id.toString(),name:user.name,email:user.email})


    }


    catch(err)
    {    console.log(err)
        res.status(500).json({message:"Login unsuccessful",error:err.message})
    }

})



router.post("/update/settings", authMiddleware, async (req, res) => {
    const {_id, name , email , oldPassword ,newPassword} = req.body;
  
    try {
      let updateCount = 0;
      if (name) updateCount++;
      if (email) updateCount++;
      if (newPassword) updateCount++;
  
      if (updateCount > 1) {
        return res.status(400).json({ error: "Only one field (name, email, or password) can be updated at a time." });
      }
  
      if (newPassword) {
        if (!oldPassword) {
          return res.status(400).json({ error: "Old password is required to update the password." });
        }
  
        const user = await User.findById(_id);
        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordCorrect) {
          return res.status(400).json({ error: "Old password is incorrect." });
        }
  
        if (newPassword.length < 8) {
          return res.status(400).json({ error: "Password must be at least 8 characters long." });
        }
  
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await User.findOneAndUpdate({ _id }, {
          $set: { password: hashedPassword }
        }, { new: true });
  
        return res.status(200).json({ message: "Password updated successfully.", updatedDocument: result });
      }
  

      const updateFields = {};
      if (name) updateFields.name = name.trim();
      if (email) updateFields.email = email.trim();
  
      const result = await User.findOneAndUpdate({ _id }, { $set: updateFields }, { new: true });
  
      if (!result) {
        return res.status(404).json({ error: "Update failed." });
      }
  
      return res.status(200).json({ message: "Updated successfully.", updatedDocument: result });
    } catch (error) {
      console.error("Error updating:", error);
      return res.status(500).json({ error: "An error occurred while updating." });
    }
  });



  router.get("/userdata", authMiddleware, async (req, res) => {
    try {
      
      const requestingUserId = req.userId;
  
      const users = await User.find(
        { _id: { $ne: requestingUserId } }, 
        { _id: 1, email: 1, name: 1 }      
      );
  
      const userData = users.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name
      }));
  
      return res.status(200).json({ success: true, userData });
    } catch (error) {
      console.error("Error fetching user data:", error);
      return res.status(500).json({ success: false, error: "An error occurred while fetching user data." });
    }
  });
  





  router.post("/share/dashboard", authMiddleware, async (req, res) => {
    try {
        const { email } = req.body; 
        const userId = req.user.id; 

        const userToShare = await User.findOne({ email });
        if (!userToShare) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

       
        await User.findByIdAndUpdate(userId, { sharedWith: userToShare._id });

        res.status(200).json({ success: true, message: "Dashboard shared successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Error sharing dashboard" });
    }
});










module.exports= router