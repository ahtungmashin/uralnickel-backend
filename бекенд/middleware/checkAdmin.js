// middleware/checkManagerOrAdmin.js

export default function checkManagerOrAdmin(req, res, next) {
  const role = req.currentUser?.role;
  if (role === 'admin' || role === 'manager') {
    return next();
  }
  return res.status(403).json({ message: 'Доступ запрещён' });
}