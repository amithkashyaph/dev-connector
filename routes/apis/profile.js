const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const axios = require("axios");
const config = require("config");

const authRequired = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route   GET api/profile
// @desc    Test route
// @access  Public
router.get("/me", authRequired, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({
        errors: [
          {
            msg: "No profile for the user",
          },
        ],
      });
    }
    return res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [
        {
          msg: error.msg,
        },
      ],
    });
  }
});

// @route   POST api/profile
// @desc    Create or Update a user profile
// @access  Private
router.post(
  "/",
  [
    authRequired,
    [
      check("status", "Please provide a status").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    // destructure profile data
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // build profile object
    const profileObject = {};
    profileObject.user = req.user.id;
    if (company) {
      profileObject.company = company;
    }
    if (website) {
      profileObject.website = website;
    }
    if (location) {
      profileObject.location = location;
    }
    if (bio) {
      profileObject.bio = bio;
    }
    if (status) {
      profileObject.status = status;
    }
    if (githubusername) {
      profileObject.githubusername = githubusername;
    }

    if (skills) {
      profileObject.skills = skills.split(",").map((skill) => skill.trim());
    }

    // build social object
    profileObject.social = {};

    if (youtube) {
      profileObject.social.youtube = youtube;
    }
    if (instagram) {
      profileObject.social.instagram = instagram;
    }
    if (linkedin) {
      profileObject.social.linkedin = linkedin;
    }
    if (twitter) {
      profileObject.social.twitter = twitter;
    }
    if (facebook) {
      profileObject.social.facebook = facebook;
    }

    // find if profile exists
    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // update the profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileObject },
          {
            new: true,
          }
        );

        return res.status(201).json(profile);
      }

      // create a new profile
      profile = new Profile(profileObject);
      await profile.save();

      return res.status(201).json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        errors: [
          {
            msg: error.message,
          },
        ],
      });
    }
  }
);

// @route   GET api/profile
// @desc    GET all profiles
// @access  Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.status(200).json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error!");
  }
});

// @route   GET api/profile/user/:userId
// @desc    GET profile of a single user
// @access  Public
router.get("/user/:userId", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.userId,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({
        errors: [
          {
            msg: "Profile not found",
          },
        ],
      });
    }

    res.json(profile);
  } catch (err) {
    console.error(err);

    if (err.kind === "ObjectId") {
      return res.status(400).json({
        errors: [
          {
            msg: "Profile not found",
          },
        ],
      });
    }
    res.status(500).send("Server error");
  }
});

// @route   DELETE api/profile
// @desc    Deletes a profile
// @access  Private
router.delete("/", authRequired, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.status(200).json({ msg: "User removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error!");
  }
});

// @route   PUT api/profile/experience
// @desc    Updates a user's experience
// @access  Private
router.put(
  "/experience",
  [
    authRequired,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExperience);

      await profile.save();
      res.status(200).json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error!");
    }
  }
);

// @route   DELETE api/profile/experience/:experienceId
// @desc    Updates a user's experience
// @access  Private
router.delete("/experience/:experienceId", authRequired, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.experienceId);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error!");
  }
});

// @route   PUT api/profile/education
// @desc    Updates a user's education
// @access  Private
router.put(
  "/education",
  [
    authRequired,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExperience = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newExperience);

      await profile.save();
      res.status(200).json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error!");
    }
  }
);

// @route   DELETE api/profile/education/:educationId
// @desc    Deletes a user's educatuon
// @access  Private
router.delete("/education/:educationId", authRequired, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.educationId);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error!");
  }
});

// @route   GET api/profile/github/:username
// @desc    Gets a user's github repos
// @access  Private
router.get("/github/:username", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClient"
      )}&client_secret=${config.get("githubSecret")}`
    );

    if (!data) {
      return res.status(404).json({ msg: "Not GitHub profile found" });
    }

    res.json(data);
  } catch (err) {
    console.error(err.message);

    if (err.response.status === 404) {
      return res.status(404).json({ msg: "Not GitHub profile found" });
    }
    res.status(500).send("Server error");
  }
});

module.exports = router;
