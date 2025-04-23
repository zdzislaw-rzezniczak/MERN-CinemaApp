const jwt = require('jsonwebtoken');

const createSecretToken = (userId, isAdmin = false) => {
    if (!userId) {
        throw new Error("User ID is required to generate token.");
    }

    const payload = {
        id: userId,
        isAdmin,
    };

    return jwt.sign(payload, process.env.TOKEN_KEY, {
        expiresIn: '1h',
    });
};

module.exports = {createSecretToken};
