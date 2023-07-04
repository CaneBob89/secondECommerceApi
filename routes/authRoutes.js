const router =require("express").Router()
const{
  register,
  login,
  logout
}=require("../controllers/authController")


router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").get(logout)

module.exports=router

