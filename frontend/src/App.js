import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import RecipeList from "./pages/RecipeList";
import { RecipeProvider } from "./context/RecipeContext";
import RecipeDetails from "./components/RecipeDetail";
import AddRecipes from "./pages/AddRecipes";
export default function App() {
  return (
    <RecipeProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Home />
                <RecipeList />
              </>
            }
          />
          <Route
            path="/recipes"
            element={
              <>
                <RecipeList />
              </>
            }
          />
          <Route path="/recipes/:id" element={<RecipeDetails />} />
          <Route
            path="/add-recipe"
            element={<AddRecipes/>}
          />
          <Route path="/about" element={<h1>Welcome to about Us Page</h1>} />
        </Routes>
      </BrowserRouter>
    </RecipeProvider>
  );
}
