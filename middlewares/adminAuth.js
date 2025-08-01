// Admin role-based authorization middleware
module.exports = (req, res, next) => {
  // Assuming req.user is populated by your auth logic
  if (req.user && req.user.isAdmin === true) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: Admins only' });
};
