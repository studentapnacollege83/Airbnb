const Home = require("../models/home");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "..", "uploads");

const photoFilePath = (photo) => {
  if (!photo) return null;
  return path.join(uploadDir, path.basename(photo));
};

const deletePhotoFile = async (photo) => {
  const filePath = photoFilePath(photo);
  if (!filePath) return;

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

// ADD HOME PAGE
exports.getAddHome = (req, res, next) => {

  res.render("host/edit-home", {
    editing: false,
    isLoggedIn:req.session.isLoggedIn,
    user: req.session.user || {},
  });
};


// HOST HOME LIST
exports.getHostHomes = (req, res, next) => {

  Home.find()
    .then( registeredHomes => {

      res.render("host/host-home-list", {
        registeredHomes: registeredHomes,
        user: req.session.user || {},
      });

    })
    .catch(error => {

      console.log(
        "Error fetching host homes:",
        error
      );

      next(error);

    });
};


// ADD HOME
exports.postAddHome = (req, res, next) => {

  const {
    houseName,
    price,
    location,
    rating,
    description
  } = req.body;

  if (!req.file) {
    return res.status(400).send("Please upload a PNG or JPEG image.");
  }

  const photo = `/uploads/${req.file.filename}`;
  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photo,
    description
  }
  );
  home.save()
    .then(() => {

      res.render("host/addhomeadded");
      

    })
    .catch(error => {

      console.log(
        "Error while adding home:",
        error
      );

      next(error);

    });
};


exports.getEditHome = (req, res, next) => {

 const homeId = req.params.homeId;

console.log("HOME ID RECEIVED:", homeId);

Home.findById(homeId)
  .then(home => {

    console.log("HOME FROM DATABASE:", home);

    if (!home) {
      console.log("Home not found");
      return res.redirect("/host/host-home-list");
    }

    res.render("host/edit-home", {
      home: home,
      editing: true,
       isLoggedIn:req.session.isLoggedIn,
       user: req.session.user || {},
    });
  })
};


// EDIT HOME
exports.postEditHome = async (req, res, next) => {

  const {
    id,
    houseName,
    price,
    location,
    rating,
    description
  } = req.body;
  try {
    const home = await Home.findById(id);
    if (!home) {
      return res.redirect("/host/host-home-list");
    }

    home.houseName=houseName;
    home.price=price;
    home.location=location;
    home.rating=rating;
    home.description=description;
    
    if (req.file) {
      await deletePhotoFile(home.photo);
      home.photo = `/uploads/${req.file.filename}`;
    }

    await home.save();
    res.redirect("/host/host-home-list");
  } catch (error) {
    next(error);
  }
};

  

// DELETE HOME
exports.postDeleteHome = async (req, res, next) => {

  const homeId = req.params.homeId;

  try {
    const home = await Home.findById(homeId);

    if (home) {
      await deletePhotoFile(home.photo);
      await Home.findByIdAndDelete(homeId);
    }

    res.redirect("/host/host-home-list");
  } catch (error) {
    next(error);
  }
};
