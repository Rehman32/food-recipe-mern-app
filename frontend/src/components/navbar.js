import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="text-xl font-bold">
          <Link to="/">Recipe Generator</Link>
        </div>
        {/* Link for desktop */}
        <ul className="hidden md:flex space-x-6">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "font-bold underline" : "hover:underline"
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/recipes"
              className={({ isActive }) =>
                isActive ? "font-bold underline" : "hover:underline"
              }
            >
              Recipes
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/add-recipe"
              className={({ isActive }) =>
                isActive ? "font-bold underline" : "hover:underline"
              }
            >
              Add Recipe
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive ? "font-bold underline" : "hover:underline"
              }
            >
              Contact Us
            </NavLink>
          </li>
        </ul>

        {/* hamburger menu for mobile  */}
        <button
          className={`md:hidden text-2xl transform transition-transform duration-300 ${
            isOpen ? "rotate-90 text-yellow-300" : "rotate-0 text-white"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>
      {/* UI for mobile  */}
      {isOpen && (
        <ul
        className="md:hidden bg-blue-600 "
      >
          <li className="p-4 border-t border-blue-400">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "font-bold underline" : "hover:underline"
              }
              onClick={() => setIsOpen(false)}
            >
              Home
            </NavLink>
          </li>
          <li className="p-4 border-t border-blue-400">
            <NavLink
              to="/recipes"
              className={({ isActive }) =>
                isActive ? "font-bold underline" : " hover:underline"
              }
              onClick={() => setIsOpen(false)}
            >
              Recipes
            </NavLink>
          </li>
          <li className="p-4 border-t border-blue-400">
            <NavLink
              to="/add-recipe"
              className={({ isActive }) =>
                isActive ? "font-bold underline " : " hover:underline "
              }
              onClick={() => setIsOpen(false)}
            >
              Add Recipe
            </NavLink>
          </li>
          <li className="p-4 border-t border-blue-400">
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive ? "font-bold underline" : "hover:underline"
              }
              onClick={() => setIsOpen(false)}
            >
              Contact Us
            </NavLink>
          </li>
        </ul>
      )}
    </nav>
  );
}
