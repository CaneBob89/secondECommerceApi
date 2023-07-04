

//ex Commented code is VERY IMPORTANT
//to cunt avgRating and total num of reviews with maths






const Review=require("../models/Review")
const Product=require("../models/Product")
const {StatusCodes}=require("http-status-codes")
const CustomError=require("../errors")
const {
checkPermission
}=require("../utils")

const createReview=async(req,res)=>{
    const {product:productId}=req.body;
    const product=await Product.findOne({
        _id:productId
    })
    if(!product){
        throw new CustomError.NotFoundError("Your review product doesn't exist")
    }

    const alreadySubmitted=await Review.findOne({
        user:req.user.userId,
        product:productId
    })
    if(alreadySubmitted){
        throw new CustomError.BadRequestError(`You have already submitted a review for ${product.name} product!`)
    }

    req.body.user=req.user.userId
    const review=await Review.create(req.body)
    console.log(review);
       
    // let avgRating=product.averageRating
    // let numOfReviews=product.numOfReviews
    // numOfReviews++
    // avgRating=(avgRating*(numOfReviews-1)+review.rating)/numOfReviews
    // product.numOfReviews=numOfReviews
    // product.averageRating=avgRating
    // await product.save()
    res.status(StatusCodes.CREATED).json({
        review
    })
}





const getAllReviews=async(req,res)=>{
    const reviews=await Review.find({}).populate({
        path:"product",
        select:"name company price"
    })
    res.status(StatusCodes.OK).json({
        count:reviews.length,
        reviews
    })
}
const getSingleReview=async(req,res)=>{
    const {id:reviewId}=req.params
    const review=await Review.findOne({
        _id:reviewId
    })

    if(!review){    
        throw new CustomError.NotFoundError(`No reviews with id ${reviewId}!`)
    }
    res.status(StatusCodes.OK).json({
        review
    })
}
const updateReview=async(req,res)=>{
        const {params:{id:reviewId},
        body:{rating,title,comment}
    }=req
    const review=await Review.findOne({
        _id:reviewId
    })
    if(!review){    
        throw new CustomError.NotFoundError(`No reviews with id ${reviewId}!`)
    }
    checkPermission(req.user,review.user)
    // const product=await Product.findOne({
    //     _id:review.product
    // })
    // let avgRating=product.averageRating
    // let numOfReviews=product.numOfReviews
    // avgRating=(avgRating*(numOfReviews)-review.rating+req.body.rating)/numOfReviews;
    // product.averageRating=avgRating
    // await product.save()
    review.title=title;
    review.rating=rating;
    review.comment=comment;
    await review.save()
    res.status(StatusCodes.OK).json({
        review
    })
}
const deleteReview=async(req,res)=>{
    const {id:reviewId}=req.params
    const review=await Review.findOne({
        _id:reviewId
    })
    if(!review){    
        throw new CustomError.NotFoundError(`No reviews with id ${reviewId}!`)
    }
    checkPermission(req.user,review.user)
    const product=await Product.findOne({
        _id:review.product
    })
    let avgRating=product.averageRating
    let numOfReviews=product.numOfReviews;
    numOfReviews--;
    avgRating=(avgRating*(numOfReviews+1)-review.rating)/numOfReviews;
    product.numOfReviews=numOfReviews;
    product.averageRating=avgRating;
    await product.save()
    console.log(await Review.findOneAndDelete({
        _id:review._id
    }))
    res.status(StatusCodes.OK).json({
        msg:"Review removed"
    })
}

const getSingleProductReviews=async(req,res)=>{
    const {id:productId}=req.params
    const reviews=await Review.find({
        product:productId
    })
    res.status(StatusCodes.OK).json({
        count:reviews.length,
        reviews
    })
}





module.exports={
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    getSingleProductReviews
}