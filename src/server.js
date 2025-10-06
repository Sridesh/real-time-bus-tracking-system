const mongoose = require('mongoose');

const app = require('./app');
const { connectDB } = require('./config/dbConnection.config');
const logger = require('./config/logger.config');

const port = process.env.PORT || 3000;

// Connect to database
connectDB();

mongoose.connection.on('open', () => {
  logger.info('Connected to Mongo Atlas');

  // listen only if the db connection is successful
  app.listen(port, '0.0.0.0', () => {
    logger.info('listening on port', port);
  });
});
