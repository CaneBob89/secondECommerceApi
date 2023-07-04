require("dotenv").config()
require("express-async-errors")

//express
const express=require("express")
const app=express()

//rest packages
const fileUpload=require("express-fileupload")
const morgan=require("morgan")
const cookieParser=require("cookie-parser")
const rateLimiter=require("express-rate-limit");
const cors=require("cors");
const helmet=require("helmet")
const xss=require("xss-clean")
const mongoSanitize=require("express-mongo-sanitize")


//database
const connectDB=require("./db/connect")

//routes
const authRoutes=require("./routes/authRoutes")
const userRoutes=require("./routes/userRoutes")
const productRouter=require("./routes/productRoutes")
const reviewRouter=require("./routes/reviewRoutes")
const orderRoutes=require("./routes/orderRoutes")

//middleware
const notFoundMiddleware=require("./middleware/not-found")
const errorHandlerMiddleware=require("./middleware/error-handler")


app.set("trust proxy",1);
app.use(
  rateLimiter({
    windowMs:15*60*1000,
    max:60
  })
);
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())

app.use(morgan("tiny"))
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))
app.use(express.static("./public"))
app.use(fileUpload())



app.get("/",async(req,res)=>{
  console.log(req.signedCookies)
  res.send("Ok")
})

app.delete("/delete",async (req,res)=>{
  const Product=require("./models/Product")
  const Review=require("./models/Review")
  const User=require("./models/User")

  await Product.deleteMany({})
  await Review.deleteMany({})
  await User.deleteMany({})
  res.send("Ok")
})


app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/users",userRoutes)
app.use("/api/v1/products",productRouter)
app.use("/api/v1/reviews",reviewRouter)
app.use("/api/v1/orders",orderRoutes)


app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)



const start=async()=>{
  const port=process.env.PORT||5000
  try {
    await connectDB(process.env.MONGO_URL)
    app.listen(port,console.log(`Listening on port ${port}...`))
  } catch (error) {
    console.log(error)
  }
}
start()