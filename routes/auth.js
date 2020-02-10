const express = require("express");
const passport = require("passport");
//const ensureLogin = require("connect-ensure-login");
const router = express.Router();
const User = require("../models/User");

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

//Login route
router.get("/login", (req, res, next) => {
  res.render("auth/login.hbs");
});
//Sign up route
router.get("/signup", (req, res, next) => {
  res.render("auth/signup.hbs");
});
//Log out route
router.get("/logout", (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

//facebook login
router.get("/facebook", passport.authenticate("facebook"));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/",
    successRedirect: "/"
  })
);

//login
// router.post(
//   "/login",
//   passport.authenticate("local", {
//     successRedirect: "/",
//     failureRedirect: "/login",
//     failureFlash: true,
//     passReqToCallback: true
//   })
// );

//sign up
router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username) {
    res.render("signup.hbs", {
      errorMessage: "The fields can't be empty"
    });
    return;
  }
  if (password.length < 6) {
    res.render("signup.hbs", {
      errorMessage: "Password must be 6 char. min"
    });
    return;
  }

  // User.findOne({ username });
  User.findOne({ username })
    .then(user => {
      if (user) {
        res.render("signup.hbs", {
          errorMessage: "The username is already taken"
        });
        return;
      }

      return bcrypt.hash(password, 10);
    })
    .then(hash => {
      return User.create({ username: username, password: hash });
    })
    .then(createdUser => {
      //console.log(createdUser);

      req.login(createdUser, () => {
        res.redirect("/");
      });
    })
    .catch(err => {
      next(err);
    });
  /* if (username === "" || password === "") {
    res.render("auth/signup", {
      errorMessage: "Indicate username and password"
    });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", {
        errorMessage: "The username already exists"
      });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashPass
    });

    newUser
      .save()
      .then(newUser => {
        req.login(newUser, err => {
          if (err) return next(err);
          res.redirect("/");
        });
      })
      .catch(err => {
        res.render("auth/signup", { message: "Something went wrong" });
      });
  }); */
});

//login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true
  })
);

module.exports = router;