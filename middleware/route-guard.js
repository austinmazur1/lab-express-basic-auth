const isLoggedOut = (req, res, next) => {
  if (!req.session.currentUser) {
    return res.redirect("/");
  }
  next();
};

const isLoggedIn = (req, res, next) => {
  if (req.session.currentUser) {
    return res.redirect("/profile");
  } else if (!req.session.currentUser) {
    return res.render("auth/login");
  }
};

module.exports = {
  isLoggedIn,
  isLoggedOut,
};
