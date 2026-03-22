const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';

/**
 * Middleware to verify JWT token by calling User Service.
 * This demonstrates inter-service communication.
 */
const verifyAuth = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - No token provided',
    });
  }

  try {
    const response = await axios.get(`${USER_SERVICE_URL}/api/users/verify`, {
      headers: { Authorization: token },
      timeout: 5000,
    });

    if (response.data.success) {
      req.user = response.data.data;
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Invalid token',
      });
    }
  } catch (error) {
    console.error('Auth verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized - Could not verify token',
    });
  }
};

module.exports = { verifyAuth };
