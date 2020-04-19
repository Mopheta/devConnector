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

//Put porque updeteamos un post, y necesitamos el id del comentario para likear
//@route  PUT api/posts/like/:id
//@desc   PUT Like a post
//@access Private - tenes que estar logeado

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//unlike
//@route  PUT api/posts/unlike/:id
//@desc   PUT Like a post
//@access Private - tenes que estar logeado

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    //GET remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  POST api/posts/comment/:id
//@desc   Add a comment to the post
//@access Private - tenes que estar logeado
router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //-password para no enviar ese dato en la respuesta
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      //Creamos el comment
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route  DELETE api/posts/comment/:id/:comment_id Ubicar el comentario por id, y luego que comentario borrar
//@desc   DELETE COMMENT
//@access Private - tenes que estar logeado

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // PUll out comment
    const comment = post.comments.find((c) => c.id === req.params.comment_id);

    // Make sure comment exist
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    //Check USER
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const removeIndex = post.comments
      .map((c) => c.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
