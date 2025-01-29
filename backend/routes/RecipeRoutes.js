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

// Fetch a recipe by ID : get
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ id: req.params.id });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//add a new recipe : post
router.post("/", async (req, res) => {
  const { name, category, description, image, ingredients, steps } = req.body;
  
  try {
    const recipeCount = await Recipe.countDocuments();
    const newRecipe = new Recipe({
      id: (100 + recipeCount) + 1,
      name,
      category,
      description,
      image,
      ingredients,
      steps,
    });

    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
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


