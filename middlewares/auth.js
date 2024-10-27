const jwt= require("jsonwebtoken")

 function authMiddleware(req,res,next){
    let token= req.header("Authorization")


    if(!token){
        return res.status(401).json({success:false,message:"User is not logged in"})
    }

    try{
        const decoded= jwt.verify(token,process.env.JWT_SECRET_KEY);
        req.userId=decoded.userId
        next()
    }
    catch(error)
    {
        res.status(401).json({success:false,message:"Invalid Token"})
    }


 }

 module.exports =authMiddleware