const router=require("express").Router();

const {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrder,
    createOrder,
    updateOrder
}=require("../controllers/orderController")

const {
    authenticateUser,
    authorizePermissions
}=require("../middleware/authentication")

router.route("/").get(authenticateUser,authorizePermissions("admin"),getAllOrders).post(authenticateUser,createOrder)

router.route("/showAllMyOrders").get(authenticateUser,getCurrentUserOrder)

router.route("/:id").get(authenticateUser,getSingleOrder).patch(authenticateUser,updateOrder)

module.exports=router