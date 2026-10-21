const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const token = authHeader.split(" ")[1];
        console.log("Received token in middleware:", token); // Debugging

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;

        // Fetch user only if it's a DELETE request (for delete-diagnosis)
        if (req.method === "DELETE") {
            const user = await User.findById(req.userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            req.user = user; // Attach user to request for delete operation
        }

        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;
