const mongoose = require('mongoose');

const app = require('./app');
const { connectDB } = require('./config/dbConnection.config');

const port = process.env.PORT || 3000;

// Connect to database
connectDB();

mongoose.connection.on('open', () => {
  console.log('Connected to Mongo Atlas');

  // listen only if the db connection is successful
  app.listen(port, () => {
    console.log('listening on port', port);
  });
});
