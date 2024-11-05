const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const AddPeople = require("../schema/member.schema");

router.post('/add-people', authMiddleware, async (req, res) => {
    const { email } = req.body;
    try {
        if (!req.user || !req.user.id) {
            return res.status(403).json({ error: "User is not authenticated." });
        }
        const newPerson = new AddPeople({
            email: email,
            creator: req.user.id
        });
        const savedPerson = await newPerson.save();
        res.status(201).json({ message: "Person added successfully", email });
    } catch (error) {
        console.error("Add People Route: Error Adding Person:", error);
        res.status(500).json({ error: "Failed to add person" });
    }
});



router.get('/add-people', authMiddleware, async (req, res) => {
    try {
        const addedPeople = await AddPeople.find({ creator: req.user.id });
        res.status(200).json(addedPeople);
    } catch (error) {
        console.error("Get Added People Route: Error Getting Added People:", error);  
        res.status(500).json({ error: "Failed to get added people" });
    }
});

module.exports = router;