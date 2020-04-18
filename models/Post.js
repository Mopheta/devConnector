const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  //referencia al usuario
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  text: {
    type: String,
    required: true,
  },
  //Name y avatar son usados para poder borrar un usuario y no sos posts(si lo desea)
  name: {
    type: String,
  },
  avatar: {
    type: String,
  },
  likes: [
    {
      //Para saber de que user vino el Like
      //Solo un like por persona ademas
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
    },
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
      text: {
        type: String,
        require: true,
      },
      name: {
        type: String,
      },
      avatar: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Post = mongoose.model('post', PostSchema);
