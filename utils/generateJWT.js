const jwt = require('jsonwebtoken');

// Generate a JSON Web Token
const generateJWT = (payload) => {
  // Generate the token with the payload and a secret key
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 30 * 42 * 60 * 60 * 100
  })
  // return token;
};

export default generateJWT;