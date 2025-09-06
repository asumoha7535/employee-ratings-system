const express = require("express");
const router = express.Router();
const usersController = require("../controller/usersControllers");

// Register a new user
router.post("/register", usersController.register);
router.post("/login", usersController.login);
router.get("/get-all-users", usersController.getAllUsers);
router.get("/get-user-by-id/:id", usersController.getUserById);
router.put("/edit-by-user-id/:id", usersController.editUserById);
router.delete("/delete/:id", usersController.deleteUserById);
router.post("/forgot-password", usersController.forgotPassword);
module.exports = router;
