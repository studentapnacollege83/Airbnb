const express = require("express");

const storeRouter = express.Router();

const storeController = require("../controllers/storeController");

// Home
storeRouter.get(
  "/",
  storeController.getIndex
);

storeRouter.get(
  "/index",
  storeController.getIndex
);

// Homes
storeRouter.get(
  "/homes",
  storeController.getHomes
);

// Home details
storeRouter.get(
  "/homes/:homeId",
  storeController.getHomeDetails
);

// Booking
storeRouter.get(
  "/booking",
  storeController.getBookings
);

storeRouter.get(
  "/bookings",
  storeController.getBookings
);

// Favourites
storeRouter.get(
  "/favourites",
  storeController.getFavouriteList
);

storeRouter.post(
  "/favourites",
  storeController.postAddToFavourite
);

storeRouter.post(
  "/favourites/delete/:homeId",
  storeController.postRemoveFromFavourite
);

module.exports = storeRouter;