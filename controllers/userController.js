const User=require("../models/User")
const {StatusCodes}=require("http-status-codes")
const CustomError=require("../errors")
const {attachCookieToResponse,createTokenUser,checkPermission}=require("../utils")

const getAllUsers=async(req,res)=>{
const users=await User.find({role:"user"}).select("-password")
if(users.length<1){
   return res.status(StatusCodes.OK).json({nothing:true}) 
}
res.status(StatusCodes.OK).json({users})
}
const getSingleUser=async(req,res)=>{
    const {id:userID}=req.params
const user=await User.findOne({_id:userID}).select("-password")
if(!user){
    throw new CustomError.NotFoundError(`No user with id ${userID}`)
}
checkPermission(req.user,user._id)
res.status(StatusCodes.OK).json({user})

}
const showCurrentUser=async(req,res)=>{
res.status(StatusCodes.OK).json({user:req.user})
}
const updateUser=async(req,res)=>{
   const {name,email}=req.body
   if(!name||!email){
    throw new CustomError.BadRequestError("Must provide name and email")
   }
   const user=await User.findOne({
    _id:req.user.userId
   })
   user.name=name,
   user.email=email
  await user.save()
  const tokenUser=createTokenUser(user)
  attachCookieToResponse({res,user:tokenUser})
  res.status(StatusCodes.OK).json({
    tokenUser
  })
}

const updateUserPassword=async(req,res)=>{
const {oldPassword,newPassword}=req.body
if(!oldPassword||!newPassword){
    throw new CustomError.BadRequestError("Must provide old and new password")
}
const user=await User.findOne({_id:req.user.userId})
const isPasswordCorrect=await user.comparePassword(oldPassword)
if(!isPasswordCorrect){
    throw new CustomError.UnauthenticatedError("Must provide a valid password")
}
user.password=newPassword
await user.save()
res.status(StatusCodes.OK).json({
    msg:"Password updated"
})

}
module.exports={
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}

// const updateUser=async(req,res)=>{
//    const {name,email}=req.body
//     if(!name||!email){
//      throw new CustomError.BadRequestError("Must provide name and email")
//     }
//    const user=await User.findOneAndUpdate({
//      _id:req.user.userId
//     },{
//      name,
//      email
//    },
//    {
//      new:true,
//     runValidators:true
//    })
//     const tokenUser=createTokenUser(user)
//     attachCookieToResponse({res,user:tokenUser})
//    res.status(StatusCodes.OK).json({
//      user:tokenUser
//   })
//  }
