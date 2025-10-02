const express = require("express");
const swaggerUI = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger.config");

const app = express();

// swagger docs
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

module.exports = app;
