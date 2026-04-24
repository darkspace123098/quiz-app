export const requireAdmin = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return next();
  }
  // For API requests (JSON), return JSON error
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // For browser requests, redirect to login
  return res.redirect("/admin/login");
};

