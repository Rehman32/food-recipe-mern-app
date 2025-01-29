const mongoose=require('mongoose');

const recipeSchema=new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: {type:String,required:true},
    category:{type:String,required:true},
    description:{type:String,required:true},
    image:{type:String,required:true},
    ingredients: {type:[String],required:true},
    steps:{type:[String],required:true}
});

module.exports=mongoose.model("Recipe",recipeSchema);