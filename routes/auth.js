const router = require("express").Router();
const User = require("../models/User.model");

//import bcryptjs
const bcryptjs = require("bcryptjs");
const saltRounds = 10;

////SIGNUP ROUTE////

//get route to render our signup form
router.get("/signup", (req, res) => res.render("auth/signup"));

//post route to create our user
router.post("/signup", async (req, res, next) => {
  const { username, password } = req.body;
  console.log(username);

  //checks password length, and makes sure that both fields are filled out
  try {
    if (password.length < 6) {
      res.render("auth/signup", {
        errorMessage: "Password must be longer than 6 characters",
      });
      return;
    } else if (username === "" || password === "") {
      res.render("auth/signup", {
        errorMessage: "Please enter all fields",
      });
    }

    // Generate password hash and create user
    const salt = await bcryptjs.genSalt(saltRounds);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const userFromDB = await User.create({
      username,
      passwordHash: hashedPassword,
    });

    // get userId and redirect to their profile page
    const userId = userFromDB._id;
    res.redirect(`/profile/${userId}`);
  } catch (error) {
    next(error);
  }
});

//renders the user profile page
router.get("/profile/:id", async (req, res, next) => {
  const userId = req.params.id;

  //get the user id from the parameters and use that to send their data to the profile page
  try {
    const user = await User.findOne({ _id: userId });
    res.render("user/profile", { user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
