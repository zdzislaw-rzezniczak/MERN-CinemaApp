const jwt = require('jsonwebtoken');

const isAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: "Token missing or invalid" });
    }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        if (!decoded.isAdmin) {
            return res.status(401).json({ success: false, message: "Admin access required" });
        }
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: "Token is invalid", error });
    }
};

module.exports = isAdmin;