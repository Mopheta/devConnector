const express = require('express');
const connectDB = require('./config/db');

const app = express();

//Connect Database
connectDB();

app.get('/', (req, res) => res.send('API Running')); //para testear con postman

const PORT = process.env.PORT || 5000; //busca si hay un puerto(luego heroku si no abre el 5000)

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
