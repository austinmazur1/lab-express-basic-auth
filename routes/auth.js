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
    } else if (username === User.findOne({username})) {
      res.render("auth/signup", {
        errorMessage: "Username already exists"
      })
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

//At first was taking id from param to find user and display the info on the page
//renders the user profile page
// router.get("/profile/:id", async (req, res, next) => {
//   const userId = req.params.id;

//   //get the user id from the parameters and use that to send their data to the profile page
//   try {
//     const user = await User.findOne({ _id: userId });
//     res.render("user/profile", { user });
//   } catch (error) {
//     next(error);
//   }
// });

router.get('/profile', (req, res) => {
  res.render('user/profile', {userInSession: req.session.currentUser})
})

//Login route to render form
router.get("/login", (req, res) => res.render("auth/login"));

//Login in post route
router.post("/login", async (req, res, next) => {
  //grab the data passed from the form, in this case we are asking
  //username and password
  const { username, password } = req.body;
  console.log(username, password);
  console.log(req.session);
  try {
    //make sure they are submiting both fields
    if (username === "" || password === "") {
      res.render("auth/login", {
        //Add if statement to views page to display message if needed
        errorMessage: "Please enter both username and password to login",
      });
      return;
    } else if (req.session.currentUser) {
      res.render('auth/login', {
        loggedIn: 'You are already loged in'
      })
    }

    //mongoose query to check for user
    const user = await User.findOne({ username });

    //if user not found we send an error
    if (!user) {
      return res.status(401).send("Invalid username or password");

      //if user exists, we then compare the password the entered and the hashedpassword in DB
    } else if (bcryptjs.compareSync(password, user.passwordHash)) {
      //Save user in the session if password is correct
      req.session.currentUser = user;
      res.redirect(`/profile`);
    } else {
      res.render("auth/login", {
        errorMessage: "Incorrect password",
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
