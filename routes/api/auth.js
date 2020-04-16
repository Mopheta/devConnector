//routes
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const User = require('../../models/User');

// Express validator(documentacion)
const { check, validationResult } = require('express-validator/check');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

//@route  GET api/auth
//@desc   Test route
//@access Public
//El middleware para ser usado se agrega como segundo parametro
//al usarlo, generamos que esa ruta este protegida
router.get('/', auth, async (req, res) => {
  try {
    //El token trae el id, verifica el webtoken que viene del cliente y verificar el usuario
    const user = await User.findById(req.user.id).select('-password');
    //por el decoded hecho en user.js retorna todos menos el password(seguridad)
    res.json(user); //devuelve el json de user con la informacion
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

//@route  POST api/auth
//@desc   Authenticate user & get token
//@access Public - asi puedo obetener el token
router.post(
  '/',
  [
    //express validations.
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    //Formateo de errores.
    const errors = validationResult(req);
    //te devuelve un array con los errores parametro y mensaje en formato json
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email }); //va a buscarlo a la base de datos por lo que usa await

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      //bcrypt compare, toma un texto plano password y lo encripta y lo compara para ver si hay match
      const isMatchPassword = await bcrypt.compare(password, user.password);

      if (!isMatchPassword) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      // Return jsonwebtoken, cuando te registras, quiero que te quedes logeado.
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'), //jwt.io - lo traigo de config
        { expiresIn: 360000 }, //Tiempo que va a durar la session abierta
        (err, token) => {
          //Si existe algun error.
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.errpr(err.message);
      res.status(500).send('Server error --');
    }
  }
);
