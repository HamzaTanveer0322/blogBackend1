require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('./model/usermodels'); // Adjust the path to your User model

const userauthorized = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader.split(' ')[1];

  if (!token ) {

    console.log('No authorization header');
    return genratetoken(req, res, next);
  }

  
  try {
    const decoded = jwt.verify(token, process.env.Secret_key);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.log('Token verification failed:', err);
    res.status(401).send('Token is not valid');
  }
};

const genratetoken = async (req, res, next) => {
  const refreshToken = req.cookies.refresh;
  if (!refreshToken) {
    return res.status(400).send('No refresh token found');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.Secret_key);
    const existingUser = await User.findById(decoded.userId);
    if (!existingUser) {
      return res.status(401).send('User not found');
    }
    
    const newAccessToken = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      process.env.Secret_key,
      { expiresIn: "3m" }
    );

    res.status(200).json({
      message: 'Access token refreshed',
      acesstoken: newAccessToken
    });
    console.log('Access token')
    next();
  } catch (err) {
    console.log('Refresh token verification failed:', err);
    res.status(401).send('Invalid refresh token');
  }
};

module.exports =  userauthorized;
