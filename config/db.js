//MONGO DB CONNECTION
const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI'); //lo trae de default file

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true, //Si no te da un error de consola debido a un strin deprecated
      useFindAndModify: false,
    });

    console.log('Kevin -- MongoDB connected... yeah');
  } catch (err) {
    console.error(err.message);

    //Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
