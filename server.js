const express = require('express');
const connectDB = require('./config/db');
const path = require('path');

const app = express();

//Connect Database
connectDB();

// Init MIddleware //Postman, testearlo
app.use(express.json({ extended: false }));

// app.get('/', (req, res) => res.send('API Running')); //para testear con postman

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

//Serve static assests in production

if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  //Serve
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000; //busca si hay un puerto(luego heroku si no abre el 5000)

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
