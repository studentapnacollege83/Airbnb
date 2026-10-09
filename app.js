/* cd "C:\Users\ADMIN\Desktop\Airbnb image upload" */
//run check guest if error
//revise from codex
const path = require("path");
const fs = require("fs");
const express = require("express");
const session=require("express-session")
const multer=require('multer')
const mongoose = require("mongoose");
const MongoDBStore=require('connect-mongodb-session')(session)

const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");

const DB_PATH =
  "mongodb+srv://Ankitsharma:sharmaji7878@ankitsharma.vbjoyvy.mongodb.net/airbnb?appName=AnkitSharma";

const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const uploadDir = path.join(rootDir, "uploads");

// Multer does not create its destination directory automatically.
fs.mkdirSync(uploadDir, { recursive: true });

const app = express();

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(rootDir, "views"));

const store=new MongoDBStore({
  uri:DB_PATH,
  collection:'sessions'
})

// Form data
const randomString = (length) => {
  const characters =
    '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return result;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Windows file names cannot contain ':' (present in ISO timestamps).
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomString(12)}${extension}`);
  }
});
const fileFilter=(req,file,cb)=>{
  if(file.mimetype==='image/png' || file.mimetype==='image/jpg' || file.mimetype==='image/jpeg'){
    cb(null,true)
  }else{
    cb(null,false)
  }
}
const multerOptions={
  storage,
  fileFilter
}
app.use(express.urlencoded({ extended: true }));
app.use(multer(multerOptions).single('photo'))
// Static files
app.use(express.static(path.join(rootDir, "public")));
app.use("/uploads",express.static(path.join(rootDir, "uploads")))
app.use("/host/uploads",express.static(path.join(rootDir, "uploads")))
app.use("/homes/uploads",express.static(path.join(rootDir, "uploads")))
app.use(session({
secret:"ankit sharma",
resave:false,
saveUninitialized:true,
store:store,
}))

// Make the login state available to every EJS view and partial.
app.use((req, res, next) => {
  res.locals.isLoggedIn = Boolean(req.session.isLoggedIn);
  res.locals.user = req.session.user || {};
  next();
});


// Login status


// Store routes
app.use(storeRouter);

// Auth routes
app.use(authRouter);

// Host routes
app.use("/host", (req, res, next) => {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});

app.use("/host", (req, res, next) => {
  if (req.session.user?.userType === "host") {
    return next();
  }

  res.redirect("/");
});

app.use("/host", hostRouter);

// 404
app.use(errorsController.pageNotFound);

// Server
const PORT = 3000;


mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("connected to mongo");

    app.listen(PORT, () => {
      console.log(`Server running on address http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("error while connecting to mongo:", err);
  });
