const express=require('express');
const Recipe=require("../models/Recipe");   

const router=express.Router();

//fetch all recipes : get
router.get('/',async(req,res)=>{
    try{
        const recipes=await Recipe.find();
        res.json(recipes);
    }catch(err){
        res.status(500).json({message:err.message})
    }
});

//add a new recipe : post
router.post("/",async(req,res)=>{
    const{name, category, description, image, ingredients, steps}=req.body;
    const newRecipe=new Recipe({
        name,
        category,
        description,
        image,
        ingredients,
        steps,
    });
    try{
    const savedRecipe=await newRecipe.save();
    res.status(201).json(savedRecipe);
    }catch(err){
        res.status(400).json({message:err.message});
    }
});

// DELETE: Remove a recipe by ID
router.delete("/:id", async (req, res) => {
    try {
      const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
      if (!deletedRecipe) return res.status(404).json({ message: "Recipe not found" });
      res.json({ message: "Recipe deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

module.exports=router;


