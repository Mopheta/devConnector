//routes
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const User = require('../../models/User');

//@route  GET api/auth
//@desc   Test route
//@access Public
//El middleware para ser usado se agrega como segundo parametro
router.get('/', auth, async (req, res) => {
  try {
    //El token trae el id
    const user = await await User.findById(req.user.id).select('-password');
    //por el decoded hecho en user.js retorna todos menos el password(seguridad)
    res.json(user); //devuelve el json de user con la informacion
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
