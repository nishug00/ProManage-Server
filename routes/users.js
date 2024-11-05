const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const RegisterUser = require("../schema/user.schema");
const dotenv = require("dotenv");
const authMiddleware = require("../middleware/auth");

dotenv.config();

router.post("/register",async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  try {
    const ifUserExists = await RegisterUser.findOne({ email });
    if (ifUserExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new RegisterUser({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
});
// Get all registered users
router.get("/registered-users", async (req, res) => {
  try {
    const users = await RegisterUser.find({}, { password: 0 }); // Exclude password for security
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await RegisterUser.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Wrong email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Wrong email or password" });
    }

    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login Error:", error); // Log any errors that occur
    res.status(500).json({ message: "Server error during login" });
  }
});



router.get("/user-details", authMiddleware, async (req, res) => {
    const userId = req.user.id; // Use the user ID from the token
    try {
        const user = await RegisterUser.findById(userId, "username email");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({userid: user._id, username: user.username, email: user.email });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Server error while fetching user details" });
    }
});

router.put('/update-details/:userid', async (req, res) => {
  const { username, updateEmail, oldPassword, newPassword } = req.body;
  const { userid } = req.params;

  try {
    // Log if User ID is missing
    if (!userid) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Fetch the user from the database
    const user = await RegisterUser.findById(userid);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine fields provided for updating
    const fieldsToUpdate = [
      username ? 'username' : null,
      updateEmail ? 'email' : null,
      newPassword ? 'password' : null
    ].filter(Boolean);


    // Check if more than one field is selected for updating
    if (fieldsToUpdate.length > 1) {
      return res.status(400).json({ message: 'Only one field can be updated at a time' });
    }

    const updateFields = {};

    // Log each field update conditionally
    if (username) {
      updateFields.username = username;
    }
    if (updateEmail) {
      updateFields.email = updateEmail;
    }
    if (oldPassword && newPassword) {
      const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password)

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }
      
      // Hash the new password and prepare it for update
      updateFields.password = await bcrypt.hash(newPassword, 10);
    }

    // Update the user document in the database
    const updatedUser = await RegisterUser.findByIdAndUpdate(userid, updateFields, { new: true });
    if (updatedUser) {
      res.status(200).json({ message: 'User information updated successfully', user: updatedUser });
    } else {
      res.status(500).json({ message: 'User update failed' });
    }
  } catch (error) {
    console.error('Error updating user information:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post("/check-user", async (req, res) => {
  const { username, email } = req.body;

  try {
    const user = await RegisterUser.findOne({ $or: [{ username }, { email }] });

    if (user) {
      return res.json({ exists: true });
    }

    return res.json({ exists: false });
  } catch (error) {
    console.error("Error checking user existence:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = router;
