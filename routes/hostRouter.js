const express = require("express");

const hostRouter = express.Router();

const hostController = require("../controllers/hostController");

// Add Home
hostRouter.get(
  "/add-home",
  hostController.getAddHome
);

hostRouter.post(
  "/add-home",
  hostController.postAddHome
);

// Host Home List
hostRouter.get(
  "/host-home-list",
  hostController.getHostHomes
);

// Edit Home
hostRouter.get(
  "/edit-home/:homeId",
  hostController.getEditHome
);

hostRouter.post(
  "/edit-home",
  hostController.postEditHome
);

// Delete Home
hostRouter.post(
  "/delete-home/:homeId",
  hostController.postDeleteHome
);

module.exports = hostRouter;