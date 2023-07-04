const User=require("../models/User")
const {StatusCodes}=require("http-status-codes")
const CustomError=require("../errors")
const{createJWT,
  attachCookieToResponse,
  createTokenUser
}=require("../utils")

const register=async(req,res)=>{
  const {email,name,password}=req.body
  const already=await User.findOne({email})
  if(already){
    throw new CustomError.BadRequestError("You must choose another E-Mail!")
  }
// firstRegisteredUser=>Admin
const isFirstAccount=await User.countDocuments({})===0
const role=isFirstAccount?"admin":"user"

  const user=await User.create({email,name,password,role})
const tokenUser=createTokenUser(user)
  attachCookieToResponse({
    res,
    user:tokenUser
  })
  res.status(StatusCodes.CREATED).json({
    user:tokenUser
  })
  

  
}
const login=async(req,res)=>{
const {email,password}=req.body
if(!email||!password){
  throw new CustomError.BadRequestError("Must provide E-Mail and password!")
}
const user=await User.findOne({email})
if(!user){
  throw new CustomError.UnauthenticatedError(`No user with email ${email}`)

}
const compared=await user.comparePassword(password)
if(!compared){
  throw new  CustomError.UnauthenticatedError("No user with this password")
}
const tokenUser=createTokenUser(user)

attachCookieToResponse({res,user:tokenUser})
res.status(StatusCodes.OK).json({
  user:tokenUser
})

}
const logout=async(req,res)=>{
  res.cookie("token","logout",{
    httpOnly:true,
    expires:new Date(Date.now())
  })
  res.status(StatusCodes.OK).json({msg:"user logged out"})
}
module.exports={
  register,
  login,
  logout
}