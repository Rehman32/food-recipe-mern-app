import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RecipeContext } from "../context/RecipeContext";
import axios from "axios";
export default function AddRecipe() {
  const { recipes, setRecipes } = useContext(RecipeContext);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    image: "",
  });
  const [ingredients, setIngredients] = useState([""]); // Array for dynamic ingredients
  const [steps, setSteps] = useState([""]); // Array for dynamic steps
  const [error, setError] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle dynamic ingredient input changes
  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = value;
    setIngredients(updatedIngredients);
  };

  // Handle dynamic step input changes
  const handleStepChange = (index, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = value;
    setSteps(updatedSteps);
  };

  // Add or remove dynamic fields
  const addIngredientField = () => setIngredients([...ingredients, ""]);
  const removeIngredientField = (index) =>
    setIngredients(ingredients.filter((_, i) => i !== index));

  const addStepField = () => setSteps([...steps, ""]);
  const removeStepField = (index) =>
    setSteps(steps.filter((_, i) => i !== index));

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name ||
      !formData.category ||
      !formData.description ||
      !formData.image ||
      ingredients.some((ingredient) => !ingredient) ||
      steps.some((step) => !step)
    ) {
      setError("All fields are required, including ingredients and steps!");
      return;
    }
    try{
      const res=await axios.post('http://localhost:5000/api/recipes',formData);
      alert('data inserted succesfully');
    }catch(err){
      alert('Error while inserting data');
    }
    // Create new recipe object
    const newRecipe = {
      id: recipes.length + 1,
      ...formData,
      ingredients,
      steps,
    };

  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Add New Recipe</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        {/* Basic Fields */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Recipe Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Image URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dynamic Ingredients */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Ingredients</label>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeIngredientField(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredientField}
            className="mt-2 text-blue-500 hover:text-blue-700"
          >
            Add Ingredient
          </button>
        </div>

        {/* Dynamic Steps */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Steps</label>
          {steps.map((step, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeStepField(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addStepField}
            className="mt-2 text-blue-500 hover:text-blue-700"
          >
            Add Step
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Add Recipe
        </button>
      </form>
    </div>
  );
}
