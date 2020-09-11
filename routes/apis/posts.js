const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const authRequired = require("../../middleware/auth");
const User = require("../../models/User");
const Post = require("../../models/Post");

// @route   POST api/posts
// @desc    create a post
// @access  Private
router.post(
  "/",
  [authRequired, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      const post = await Post(newPost).save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get("/", authRequired, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error!");
  }
});

// @route   GET api/posts/:postId
// @desc    Get a single post
// @access  Private
router.get("/:postId", authRequired, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).sort({ date: -1 });

    if (!post) {
      return res.status(404).json({
        msg: "Post Not Found",
      });
    }

    res.status(200).json(post);
  } catch (error) {
    console.log(error);

    if (error.kind === "ObjectId") {
      return res.status(404).json({
        msg: "Post Not Found",
      });
    }
    res.status(500).send("Server error!");
  }
});

// @route   DELETE api/posts/:postId
// @desc    Delets a post
// @access  Private
router.delete("/:postId", authRequired, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({
        msg: "You are not authorized",
      });
    }

    if (!post) {
      return res.status(404).json({
        msg: "Post Not Found",
      });
    }

    await post.remove();

    res.status(200).json({ msg: "Post removed" });
  } catch (error) {
    console.log(error);

    if (error.kind === "ObjectId") {
      return res.status(404).json({
        msg: "Post Not Found",
      });
    }
    res.status(500).send("Server error!");
  }
});

// @route   PUT api/posts/likes/:postId
// @desc    Likes a post
// @access  Private
router.put("/like/:postId", authRequired, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({
        msg: "Post already liked",
      });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.status(200).json(post.likes);
  } catch (error) {
    console.error(error);

    res.status(500).send("Server error");
  }
});

// @route   DELETE api/posts/likes/:postId
// @desc    Unlikes a post
// @access  Private
router.put("/unlike/:postId", authRequired, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({
        msg: "Post has not been liked",
      });
    }

    const removeIndex = post.likes
      .map((like) => like.user.id.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();

    await post.save();

    res.status(200).json(post.likes);
  } catch (error) {
    console.error(error);

    res.status(500).send("Server error");
  }
});

// @route   POST api/posts/comment/:postId
// @desc    Create a comment for a post
// @access  Private
router.post(
  "/comment/:postId",
  [authRequired, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.postId);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();

      // const post = await Post(newPost).save();
      res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   DELETE api/posts/comment/:postId/:commentId
// @desc    Delete a comment for a post
// @access  Private
router.delete("/comment/:postId/:commentId", authRequired, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    // const user = await User.findById(req.user.id).select("-password");
    const post = await Post.findById(req.params.postId);

    // Pull out the comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.commentId
    );

    // Check if comment exists
    if (!comment) {
      return res.status(404).json({
        msg: "Comment doesnt exist",
      });
    }

    // Check to see if logged in user is the owner of the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({
        msg: "You are unauthorized",
      });
    }

    const removeIndex = post.comments.indexOf(comment);

    post.comments.splice(removeIndex, 1);

    await post.save();

    // const post = await Post(newPost).save();
    res.json(post.comments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
