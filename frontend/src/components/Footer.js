import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-10">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Food Recipe App. All rights reserved.
        </p>
        <div className="mt-4 flex justify-center space-x-4">
          <a href="#" className="text-blue-400 hover:text-blue-600">Privacy Policy</a>
          <a href="#" className="text-blue-400 hover:text-blue-600">Terms of Service</a>
          <a href="/contact" className="text-blue-400 hover:text-blue-600">Contact Us</a>
        </div>
        <div className="mt-4">
          <a href="https://github.com/Rehman32/" className="text-blue-400 hover:text-blue-600 mx-2">Github</a>
          <a href="https://twitter.com" className="text-blue-400 hover:text-blue-600 mx-2">Twitter</a>
          <a href="https://instagram.com" className="text-blue-400 hover:text-blue-600 mx-2">Instagram</a>
        </div>
      </div>
    </footer>
  );
}
