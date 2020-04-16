//IMPORTS
const express = require('express');
const router = express.Router();
const config = require('config');
const jwt = require('jsonwebtoken');

//pra crear los avatars
const gravatar = require('gravatar');

//Para encriptar la password
const bcrypt = require('bcryptjs');

// Express validator(documentacion)
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');

//@route  POST api/users
//@desc   Register user
//@access Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    //Formateo de errores.
    const errors = validationResult(req);
    //te devuelve un array con los errores parametro y mensaje en formato json
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email }); //va a buscarlo a la base de datos por lo que usa await

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      // Get users gravatar (based on email)

      const avatar = gravatar.url(email, {
        s: '200', //size
        r: 'pg', //rating,
        d: 'mm', //default image
      });

      user = new User({
        //Creamos el usuario
        name,
        email,
        avatar,
        password,
      });

      // Encrypt password (bcrypt)
      const salt = await bcrypt.genSalt(10); //ver documentation

      user.password = await bcrypt.hash(password, salt);

      await user.save(); //Guardamos el usuario en la base de datos

      // Return jsonwebtoken, cuando te registras, quiero que te quedes logeado.
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
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

module.exports = router;
