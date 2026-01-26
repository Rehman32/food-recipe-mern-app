import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import RecipeList from "./pages/RecipeList";
import { RecipeProvider } from "./context/RecipeContext";
import RecipeDetails from "./components/RecipeDetail";
import AddRecipes from "./pages/AddRecipes";
import SearchBar from "./components/searchbar";
import Footer from "./components/Footer";
import ContactUs from "./pages/ContactUs";

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
                <div className="mt-5 flex justify-center">
                  <SearchBar />
                </div>
                <RecipeList />
              </>
            }
          />
          <Route path="/recipes/:id" element={<RecipeDetails />} />
          <Route path="/add-recipe" element={<AddRecipes />} />
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </RecipeProvider>
  );
}
