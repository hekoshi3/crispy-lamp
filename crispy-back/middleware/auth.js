require('dotenv').config();

function adminAuth(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.admin_key;
  if (key && key === process.env.ADMIN_AUTH_KEY) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

module.exports = adminAuth;