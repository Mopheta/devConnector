//routes
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

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

//@route  POST api/profile
//@desc   Post create or update a user profile
//@access Private
//valida el auth, y en [] los checks para aquellos campos mandatorios
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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

    //BUILD PROFILE OBJECT

    const profileFields = {};
    profileFields.user = req.user.id; //guardo el user que me vino por el token.
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    if (skills) {
      //skills viene como un texto encadenado.
      //Convierto el campo en un array, lo separo por comas, y a cada skill en ese array, le aplico el trim()
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    // BUILD SOCIAL OBJECT
    profileFields.social = {}; //si no se ta error de que cannot find youtube of undefined
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id }); //viene del token
      if (profile) {
        //Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true } //devuelve el documento modificado
        );

        console.log('Profile updated');
        return res.json(profile);
      }

      //Create a Profile
      profile = new Profile(profileFields);

      await profile.save();
      console.log('Profile created');
      res.json(profile);
      //
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//NAME: GET ALL PROFILES
//@route  GET api/profile
//@desc   Get all profiles
//@access Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//NAME: GET PROFILE BY USER ID
//@route  GET api/profile/user/:user_id
//@desc   Get profile by user ID
//@access Public

router.get('/user/:user_id', async (req, res) => {
  try {
    //Se utiliza params porque el id viene de la URL
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    //Kind para ver si el error es del tipo OBJECTID
    //esto pasa porque si pasamos un id erroeno cae en el metodo de !profile
    //si el id no tiene el formato correcto cae en el catch, lo cual mostraria un error del server
    //pero no lo es debido a que el error esta en el dato.
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
