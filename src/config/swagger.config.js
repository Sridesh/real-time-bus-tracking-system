const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Real Time Bus Tracking System - API",
      version: "1.0.0",
      description:
        "A web API service to track, manage and update buses and routes",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
      },
    ],
  },
  apis: ["src/routes/**/*.js"],
};

const swaggerSpecs = swaggerJsDoc(options);

module.exports = swaggerSpecs;
