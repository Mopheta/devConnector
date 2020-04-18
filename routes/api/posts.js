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

//@route  GET api/posts
//@desc   GET all post
//@access Private - tenes que estar logeado
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 }); //newest first
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  GET api/posts/:id
//@desc   GET post by id
//@access Private - tenes que estar logeado
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); //newest first

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      //Objeto err.propiedad kind, es igual a objectID, si lo es,
      //No es un formated object ID
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

//@route  DELETE api/posts/:id
//@desc   DELETE post by id
//@access Private - tenes que estar logeado
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check on the user (only user owener of the post can delete)
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await post.remove();

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

module.exports = router;
