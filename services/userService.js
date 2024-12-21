const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports = {
  register: async (req, res) => {
    try {
      const exists = await userModel.findOne({
        email: req.body.email,
      });

      if (exists) {
        return res.status(409).json({
          message: "user_already_exists",
        });
      }

      const password = req.body.password;
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          message: "password_requirements_not_met",
          details: "Password must be at least 8 characters long and contain both letters and numbers.",
        });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      const newUser = await new userModel({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        profilePicture: req.body.profilePicture,
        bio: req.body.bio,
        password: hashedPassword,
      }).save();

      const token = jwt.sign(
        {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.lastName,
          profilePicture: newUser.profilePicture,
          bio: newUser.bio,
        },
        process.env.SECRET_KEY
      );

      res.status(201).json({ token });
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  },

  login: async (req, res) => {
    try {
      const user = await userModel.findOne({
        email: req.body.email,
      });

      if (!user) {
        return res.status(404).json({
          message: "user_not_found",
        });
      }

      if (bcrypt.compareSync(req.body.password, user.password)) {
        const token = jwt.sign(
          {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
          },
          process.env.SECRET_KEY
        );

        return res.status(200).json({ token });
      } else {
        return res.status(404).json({
          message: "user_not_found",
        });
      }
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  },
};
