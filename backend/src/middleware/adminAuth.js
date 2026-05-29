const auth = require('./auth');

/**
 * Admin authorization middleware
 * Runs auth middleware first, then checks for admin role.
 * Returns 403 Forbidden if the user is not an admin.
 */
const adminAuth = async (req, res, next) => {
  // First, run the JWT auth middleware
  auth(req, res, (err) => {
    if (err) return next(err);

    // After auth, check role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Admin access required.',
      });
    }

    next();
  });
};

module.exports = adminAuth;
