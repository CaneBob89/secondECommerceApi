const mongoose=require("mongoose")
const ProductSchema=new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:[true,"Must provide a name"],
        maxlength:[100,"Name cannot be more than 100 characters"]
    },
    price:{
        type:Number,
        required:[true,"Must provide a price"],
        default:0
    },
    description:{
        type:String,
        required:[true,"Must provide a description"],
        maxlength:[1000,"Description cannot be more than 1000 characters"]
    },
    image:{
        type:String,
        default:"/uploads/example.jpeg"
    },
    category:{
        type:String,
        required:[true,"Must provide a category"],
        enum:["office","kitchen","bedroom"]
    },
    company:{
        type:String,
        required:[true,"Must provide a company"],
        enum:{
            values:["ikea","liddy","marcos"],
            message:"{VALUE} is not supported"
        }
    },
    colors:{
        type:[String],
        default:["#222"],
        required:true
    },
    featured:{
        type:Boolean,
        default:false
    }
    ,
    freeShipping:{
        type:Boolean,
        default:false
    }
    ,
    inventory:{
        type:Number,
        required:true,
        default:15
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    averageRating:{
        type:Number,
        default:0
    },
    numOfReviews:{
        type:Number,
        default:0
    }
    }
    ,
    {timestamps:true,toJSON:{virtuals:true},toObject:{virtuals:true}}
    )

ProductSchema.virtual("reviews",
{
    ref:"Review",
    localField:"_id",
    foreignField:"product",
    justOne:false,
    // match:{rating:2}
}
)


    

module.exports=mongoose.model("Product",ProductSchema)


    