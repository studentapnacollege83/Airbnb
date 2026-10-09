
const Home = require("../models/home");
const User=require("../models/user")

// HOME / INDEX

exports.getIndex = (req, res, next) => {

  Home.find()
    .then(registeredHomes => {

      res.render("store/index", {
        registeredHomes: registeredHomes,
      });

    })
    .catch(error => {

      console.log("Error fetching homes:", error);
      next(error);

    });
};


// HOMES
exports.getHomes = (req, res, next) => {

  Home.find()
    .then(registeredHomes => {

      res.render("store/home-list", {
        registeredHomes: registeredHomes,
      });

    })
    .catch(error => {

      console.log("Error fetching homes:", error);
      next(error);

    });
};


// BOOKINGS
exports.getBookings = (req, res) => {

  res.render("store/bookings");

};

// FAVOURITE LIST
exports.getFavouriteList = async(req, res, next) => {
const userId= req.session.user._id
const user= await User.findById(userId).populate('favourites')
        res.render("store/favourite-list", {
        favouriteHomes: user.favourites,
      });

};


// ADD TO FAVOURITE
exports.postAddToFavourite =async (req, res, next) => {

  const homeId = req.body.homeId;
 const userId= req.session.user._id;
 const user=await User.findById(userId)

if (!user.favourites.some(favouriteId => favouriteId.toString() === homeId)) {
 user.favourites.push(homeId)
 await user.save()
}
      res.redirect("/favourites");

};


// REMOVE FROM FAVOURITE
exports.postRemoveFromFavourite =async (req, res, next) => {

  const homeId = req.params.homeId;
 const userId= req.session.user._id;
 const user=await User.findById(userId)
if (user.favourites.some(favouriteId => favouriteId.toString() === homeId)) {
 user.favourites = user.favourites.filter(
   favouriteId => favouriteId.toString() !== homeId
 );
 await user.save()
}
res.redirect("/favourites")
};


// HOME DETAILS
exports.getHomeDetails = (req, res, next) => {

  const homeId = req.params.homeId;

  Home.findById(homeId)
    .then(home => {

      if (!home) {

        console.log("Home not found");

        return res.redirect("/");

      }

      res.render("store/home-detail", {
        home: home,
      });

    })
    .catch(error => {

      console.log(
        "Error fetching home details:",
        error
      );

      next(error);

    });
};

//solve error
//revise complete
//continue to 22
