const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// ==================== GET LOGIN ====================

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    isLoggedIn: false,
    errors: [],
    oldInput: {
      email: "",
    },
    user:{},
  });
};

// ==================== POST LOGIN ====================

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(422).render("auth/login", {
        isLoggedIn: false,
        errors: ["User Does Not Exist"],
        oldInput: {
          email,
        },
        user:{}
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(422).render("auth/login", {
        isLoggedIn: false,
        errors: ["Invalid Password"],
        oldInput: {
          email,
        },
        user:{}
      });
    }

    const userType = String(user.userType || "guest").trim().toLowerCase();

    req.session.isLoggedIn = true;
    req.session.user = {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: userType === "host" ? "host" : "guest",
    };
    req.session.save((err) => {
      if (err) {
        return next(err);
      }

      res.redirect("/");
    });
  } catch (err) {
    next(err);
  }
};

// ==================== POST LOGOUT ====================

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }

    res.redirect("/login");
  });
};

// ==================== GET SIGNUP ====================

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    isLoggedIn: false,
    errors: [],
    oldInput: {
      firstName: "",
      lastName: "",
      email: "",
      userType: "",
      user:{},
    },
  });
};

// ==================== POST SIGNUP ====================

exports.postSignup = [
  check("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First Name Should Be 2 Character Long")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First Name Should Contain Only Alphabets"),

  check("lastName")
    .trim()
    .matches(/^[A-Za-z\s]*$/)
    .withMessage("Last Name Should Contain Only Letters"),

  check("email")
    .isEmail()
    .withMessage("Please Enter A Valid E-Mail")
    .normalizeEmail(),

  check("password")
    .isLength({ min: 8 })
    .withMessage("Password Must Be 8 Character Long")
    .matches(/[A-Z]/)
    .withMessage("Password Must Contain At Least 1 Upper Case Character")
    .matches(/[a-z]/)
    .withMessage("Password Must Contain At Least 1 Lower Case Character")
    .matches(/[0-9]/)
    .withMessage("Password Must Contain At Least 1 Number")
    .matches(/[!@#&]/)
    .withMessage("Password Must Contain Special Character")
    .trim(),

  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password Do Not Match");
      }

      return true;
    }),

  check("userType")
    .notEmpty()
    .withMessage("Please Enter UserType")
    .isIn(["guest", "host"])
    .withMessage("Invalid User Type"),

  check("terms")
    .notEmpty()
    .withMessage("Please Accept Terms And Condition")
    .custom((value, { req }) => {
      if (value !== "on") {
        throw new Error("Please Accept Terms And Condition");
      }

      return true;
    }),

  async (req, res, next) => {
    const {
      firstName,
      lastName,
      email,
      password,
      userType,
    } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        isLoggedIn: false,
        errors: errors.array().map((err) => err.msg),
        oldInput: {
          firstName,
          lastName,
          email,
          userType,
        },
        user:{}
      });
    }

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(422).render("auth/signup", {
          isLoggedIn: false,
          errors: ["User Already Exists"],
          oldInput: {
            firstName,
            lastName,
            email,
            userType,
          },
          user:{}
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        userType,
      });

      await user.save();

      req.session.isLoggedIn = true;
      req.session.user = {
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
      };

      req.session.save((sessionError) => {
        if (sessionError) {
          return next(sessionError);
        }

        res.redirect("/");
      });
    } catch (err) {
      return res.status(422).render("auth/signup", {
        isLoggedIn: false,
        errors: [err.message],
        oldInput: {
          firstName,
          lastName,
          email,
          userType,
        },
        user:{}
      });
    }
  },
];
