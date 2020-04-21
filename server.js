require('dotenv').config();
const express = require('express');
const models = require('./models/User');
const server = express();
const cors = require('cors');
const user = require('./routes/users')
const bodyParser = require('body-parser');

server.use(bodyParser.json({}))
server.use(bodyParser.urlencoded({extended: false}))
server.use(cors());

server.use('/api', user);


let port = process.env.PORT || 3000;

models.sequelize.sync().then(function () {
    server.listen(port, () => {
        console.log(`SERVER IS RUNNING ON PORT NUMBER ${port}`);
    })
  });
