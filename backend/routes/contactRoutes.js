const express = require("express");
const Contact = require("../models/contact");
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const totalContacts = await Contact.countDocuments();
    const newContact = new Contact({
      id: totalContacts + 1,
      name,
      email,
      message,
    });
    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;