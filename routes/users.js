const userService = require("../services/userService");
var express = require('express');
var router = express.Router();

router.post("/register", userService.register);
router.post("/login", userService.login);

module.exports = router;
