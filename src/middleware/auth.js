const jwt = require('jsonwebtoken');


// Function to authenticate the token
const authenticateToken = (req, res, next) => {
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];

    if (!token) return res.status(401).json({message: 'Unauthorized'});

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({message: 'Forbidden'});
        req.user = user;
        next();
    });
}

module.exports = {
    authenticateToken
}