import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ContactUs() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate the form
    if (!formData.name || !formData.email || !formData.message) {
      setError("All fields are necessary");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/contact", formData);
      setSuccess("Data inserted successfully");
      setFormData({ name: "", email: "", message: "" });
      navigate("/");
    } catch (err) {
      setError("Error occurred while inserting data");
    }
  };

  // Auto hide message
  setTimeout(() => {
    setError("");
    setSuccess("");
  }, 4000);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>
      {/* Success Message */}
      {success && (
        <div className="absolute text-green-700 bg-green-100 p-3 rounded-lg text-center w-1/2 ml-80 transition-all">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute text-white bg-red-400 p-3 rounded-lg text-center w-1/2 ml-80 transition-all">
          {error}
        </div>
      )}

      <form
        className="bg-white shadow-md rounded-lg p-6"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Name</label>
          <input
            type="text"
            name="name"
            onChange={handleChange}
            value={formData.name}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Email</label>
          <input
            type="email"
            onChange={handleChange}
            name="email"
            value={formData.email}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
