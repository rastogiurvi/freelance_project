const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {

  
    const token = req.header('Authorization')?.replace('Bearer ', '');

   
    if (!token) {
        return res.status(401).json({ 
            message: 'No token found. Please login first.' 
        });
    }

  
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;  
        next();                 
    } catch (error) {
        res.status(401).json({ 
            message: 'Invalid token. Please login again.' 
        });
    }
};

module.exports = auth;