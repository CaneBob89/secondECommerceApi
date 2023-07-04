const Order=require("../models/Order")
const Product=require("../models/Product")

const {StatusCodes}=require("http-status-codes")
const CustomError=require("../errors")
const {checkPermission}=require("../utils")


const fakeStripeApi=async({
    amount,
    currency
})=>{
    const client_secret="random";
    return {
        client_secret,
        amount    
    }
}


const getAllOrders=async(req,res)=>{
    const orders=await Order.find({user:req.user.userId})
    res.status(StatusCodes.OK).json({
        orders
    })
}
const getSingleOrder=async(req,res)=>{
    const {id}=req.params
    const order=await Order.findOne({
        _id:id
    })
    if(!order){
        throw new CustomError.NotFoundError(`No orders with id ${id}.`)
    }
    checkPermission(req.user,order.user)
    res.status(StatusCodes.OK).json({
        order
    })
}
const getCurrentUserOrder=async(req,res)=>{
    const {userId}=req.user
    const orders=await Order.find({
        user:userId
    })
    if(!orders){
        throw new CustomError.NotFoundError(`No orders created by user with id ${userId}.`)
    }
    res.status(StatusCodes.OK).json({
        count:orders.length,
        orders
    })
}
const createOrder=async(req,res)=>{
    const {items:cartItems,tax,shippingFee}=req.body;
    if(!cartItems||cartItems.length<1){
        throw new CustomError.BadRequestError("No cart items provided.")
    }
    if(!tax||!shippingFee){
        throw new CustomError.BadRequestError("Please provide tax and shipping fee.") 
    }
    let orderItems=[];
    let subtotal=0;
    for(let item of cartItems){
        const dbProduct=await Product.findOne({_id:item.product})
        if(!dbProduct){
            throw new CustomError.NotFoundError(`No product with id ${item.product}`)
        }
        const {name,price,image}=dbProduct;
        const singleOrderItem={
            amount:item.amount,
            name,
            price,
            image,
            product:item.product
        }
        //addItemToOrder:
        orderItems=[...orderItems,singleOrderItem]
        //calculateSubTotal:
        subtotal+=price*item.amount;
    }
    // calculate total:
    const total=subtotal+tax+shippingFee;
    // get client secret:
    const paymentIntent=await fakeStripeApi({
        amount:total,
        currency:"usd"
    })
    const order=await Order.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret:paymentIntent.client_secret,
        user:req.user.userId
    });
    res.status(StatusCodes.CREATED).json({
        order,
        clientSecret:order.clientSecret
    })
}
const updateOrder=async(req,res)=>{
    const {id}=req.params;
    const {paymentIntentId}=req.body;
    const order=await Order.findOne({
        _id:id
    });
    if(!order){throw new CustomError.NotFoundError(`No orders with id ${id}.`)
    }
    checkPermission(req.user,order.user);
    order.paymentIntentId=paymentIntentId;
    order.status="paid";
    await order.save()
    res.status(StatusCodes.OK).json({
        order
    })
}
module.exports={
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrder,
    createOrder,
    updateOrder
}