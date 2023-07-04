require("dotenv").config()
const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcryptjs")
const validator=require("validator")
const UserSchema=new mongoose.Schema({
name:{
  type:String,
  required:[true,"Must provide a name"],
  minlength:3,
  maxlength:50,
  trim:true
},
email:{
  type:String,
  required:[true,"Must provide an E-Mail"],
  trim:true,
  validate:{
    validator:validator.isEmail,
    message:"Please provide valid E-Mail"
  }
  
},
password:{
  type:String,
  required:[true,"Must provide a password"],
  minlength:6,
  trim:true
},
role:{
  type:String,
  required:[true,"Must provide a role"],
  enum:["admin","user"],
  default:"user"
}
}) 

UserSchema.pre("save",async function(){
  if(!this.isModified("password")){
    return
  }
const salt=await bcrypt.genSalt(10)
this.password=await bcrypt.hash(this.password,salt)
})

UserSchema.methods.comparePassword=async function(psw){
const compared=await bcrypt.compare(psw,this.password)
return compared
}


module.exports=mongoose.model("User",UserSchema)