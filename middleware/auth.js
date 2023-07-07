const jwt = require('jsonwebtoken');
const User = require('../models/user.model')

const auth = async (req, res, next) => {    
    try {      
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.SECRET_KEY, { algorithm: 'HS256' });
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
      
        if (!user) {
          return res.status(401).json({
            error: true,
            check: false,
            message: "Please authenticate!"
          });
        }
      
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send({'error':'Please Authenticate!'})
    }

}

module.exports = auth
