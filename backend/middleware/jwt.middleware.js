const jwt = require('jsonwebtoken');
// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({message: 'Authentication required.'});
        return;
    }
    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
        if (err) {
            res.status(403).json({message: 'Invalid token.'});
            return;
        }
        req.user = decoded;
        next();
    });
};

module.exports = {verifyToken};