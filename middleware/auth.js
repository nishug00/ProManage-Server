const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;

    // Check if token is present
    if (!token) {
        return res.status(401).json({ message: "User is not logged in" });
    }

    // Check if the token has the "Bearer" prefix
    if (!token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Invalid token format" });
    }

    try {
        const tokenValue = token.split(" ")[1]; // Extract the token after "Bearer"

        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

        req.user = decoded; // Attach decoded token data (e.g., id, email) to req.user

        next();
    } catch (error) {
        console.error("Error verifying token:", error.message);
        res.status(401).json({ message: "User is not logged in" });
    }
}

module.exports = authMiddleware;
