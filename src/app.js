const express = require("express");
const swaggerUI = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger.config");
const routes = require("./routes");

const app = express();

// swagger docs
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

// API routes
app.use("/api", routes);

module.exports = app;
