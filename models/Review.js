
const mongoose=require("mongoose")
const ReviewSchema=new mongoose.Schema({
    rating:{
        type:Number,
        min:1,
        max:5,
        required:[true,"Please provide the rating"]
    },
    title:{
        type:String,
        trim:true,
        required:[true,"Please provide the review title"],
        maxlength:100
    },
    comment:{
        type:String,
        required:[true,"Please provide the review comment"]
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    product:{
        type:mongoose.Types.ObjectId,
        ref:"Product",
        required:true
    }
},
{
    timestamps:true
})

ReviewSchema.index(
    {product:1,user:1},
    {unique:true}
    )


ReviewSchema.statics.calculateAverageRating=async function(productId){
   const result=await this.aggregate([
    {$match:{product:productId}},
    {$group:{
        _id:null,
        averageRating:{$avg:"$rating"},
        numOfReviews:{$sum:1}
    }}
   ])
   try {
    await this.model("Product").findOneAndUpdate({
        _id:productId
    },{
        averageRating:Math.ceil(result[0]?.averageRating||0),
        numOfReviews:result[0]?.numOfReviews||0
    })
   } catch (error) {
    
   }
}


ReviewSchema.post("save",async function(){
    await this.constructor.calculateAverageRating(this.product)
})
// ReviewSchema.post("findOneAndDelete",async function() {
//     await this.constructor.calculateAverageRating(this.product)
//   })
    
    module.exports=mongoose.model("Review",ReviewSchema)

//math method to calculate averageRating and numOfReviews

    //createReview with const product=await Product.findOne({_id:req.body.id})


    // let avgRating=product.averageRating
    // let numOfReviews=product.numOfReviews
    // numOfReviews++
    // avgRating=(avgRating*(numOfReviews-1)+review.rating)/numOfReviews
    // product.numOfReviews=numOfReviews
    // product.averageRating=avgRating
    // await product.save()


    //updateReview

    // const product=await Product.findOne({
    //     _id:review.product
    // })
    // let avgRating=product.averageRating
    // let numOfReviews=product.numOfReviews
    // avgRating=(avgRating*(numOfReviews)-review.rating+req.body.rating)/numOfReviews;
    // product.averageRating=avgRating
    // await product.save()

    //deleteReview

    // const product=await Product.findOne({
    //     _id:review.product
    // })
    // let avgRating=product.averageRating
    // let numOfReviews=product.numOfReviews;
    // numOfReviews--;
    // avgRating=(avgRating*(numOfReviews+1)-review.rating)/numOfReviews;
    // product.numOfReviews=numOfReviews;
    // product.averageRating=avgRating;
    // await product.save()