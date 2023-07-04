const Product=require("../models/Product")
const {StatusCodes}=require("http-status-codes")
const CustomError=require("../errors")
const path=require("path")
const Review =require("../models/Review")


const createProduct=async(req,res)=>{
    req.body.user=req.user.userId
    const product=await Product.create(req.body)
    res.status(StatusCodes.CREATED).json({
        product
    })
   
}
const getAllProducts=async(req,res)=>{
    const products=await Product.find({})
    res.status(StatusCodes.OK).json({
        count:products.length,
        products
    })
}
const getSingleProduct=async(req,res)=>{
    const {id:productId}=req.params
    const product=await Product.findOne({
        _id:productId
    }).populate("reviews")
    if(!product){
        throw new CustomError.NotFoundError(`No products with id ${productId}.`)
    }
    res.status(StatusCodes.OK).json({
        product
    })
    

}
const updateProduct=async(req,res)=>{
    const {id:productId}=req.params
    const product=await Product.findOneAndUpdate({
        _id:productId
    },
    req.body,
    {
        new:true,
        runValidators:true
    })
    if(!product){
        throw new CustomError.NotFoundError(`No products with id ${productId}.`)
    } 
    res.status(StatusCodes.OK).json({
        product
    })
}
const deleteProduct=async(req,res)=>{
    const {id:productId}=req.params
    const product=await Product.findOne({_id:productId})
    if(!product){
        throw new CustomError.NotFoundError(`No products with id ${productId}.`)
    }
    await Review.deleteMany({
        product:product._id
    })
    await Product.deleteOne({
        _id:product._id
    })
    res.status(StatusCodes.OK).json({
        msg:"Success, product removed"
    })
    
}

const uploadImage=async(req,res)=>{
    if(!req.files){
        throw new CustomError.BadRequestError("Must provide a file")
    }
    const productImage=req.files.image;
    if(!productImage.mimetype.startsWith("image")){
        throw new CustomError.BadRequestError("Must provide an image")
    }
    const maxSize=1024*1024
    if(productImage.size>maxSize){
        throw new CustomError.BadRequestError(`Image cannot be bigger than ${maxSize/(1024*1024)} MB`)
    }
    const imagePath=path.join(__dirname,`../public/uploads/${productImage.name}`)
    productImage.mv(imagePath)
    res.status(StatusCodes.CREATED).json({
        image:`/uploads/${productImage.name}`
    })
    console.log(productImage.size);
}


module.exports={
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage
}