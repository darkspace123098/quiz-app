export const requireAdmin = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return next();
  }
  
  // For API requests, always return JSON error
  if (req.originalUrl.startsWith('/api') || (req.headers.accept && req.headers.accept.includes('application/json'))) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // For browser requests (navigation), redirect to login
  return res.redirect("/admin/login");
};

