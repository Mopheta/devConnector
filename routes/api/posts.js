//routes
const express = require('express');
const router = express.Router();

//Requires
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

//Models
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

//@route  POST api/posts
//@desc   CREATE a post
//@access Private - tenes que estar logeado
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //-password para no enviar ese dato en la respuesta
      const user = await User.findById(req.user.id).select('-password');

      //Creamos el post
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
