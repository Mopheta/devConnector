//routes
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

//Model
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route  GET api/profile/me
//@desc   Get current users profile
//@access Private - Para proteger, debemos importar el auth, y pasarlo como
//segundo parametro. esto nos da seguridad mediante el token.
//mongoose devuelve una Promise, se maneja con async await.(mas claro)
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
      //Mongoose populate se usa para mostrar datos de documentos de referencia de otras colecciones
      .populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
