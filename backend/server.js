const express=require('express');
const dotenv=require('dotenv');
const mongoose=require('mongoose');
const cors=require('cors');
const recipeRoutes = require("./routes/RecipeRoutes");

dotenv.config();

const app=express();
const port=process.env.PORT || 5000;

//  middleware
app.use(express.json());    //parse json data   
app.use(cors())  //allow cross origin request
app.use("/api/recipes", recipeRoutes);

//connect to mongodb
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true, // Use new MongoDB URL parser
    useUnifiedTopology: true, // Use the new server discovery and monitoring engine
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

//routes
app.get('/',(req,res)=>{
    res.send('API is running ...')
});


app.listen(port,(req,res)=>{
    console.log(`Server is running on http://localhost: ${port}`);
});