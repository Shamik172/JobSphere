exports.protect = async (req, res, next) => {
  let token = req.cookies.token; // ✅ get token from cookies

  console.log("Token from cookies:", token); // Debugging line
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Interviewer.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
