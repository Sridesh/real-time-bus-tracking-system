const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Time Bus Tracking System - API',
      version: '1.0.0',
      description:
        'A web API service to track, manage and update buses, operators, routes, and more',
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3000/api',
      },
    ],
    components: {
      schemas: {
        Operator: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
            userId: {
              type: 'array',
              items: { type: 'string', example: '60d21b4667d0d8992e610c86' },
            },
            licenseNumber: { type: 'string', example: 'LIC12345' },
            address: { type: 'string', example: '123 Main St, Colombo' },
            province: { type: 'string', example: 'Western' },
            status: { type: 'string', example: 'active' },
            registrationDate: { type: 'string', format: 'date-time' },
            totalBuses: { type: 'integer', example: 5 },
            activeBuses: { type: 'integer', example: 3 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // ...add other schemas as needed...
      },
    },
  },
  apis: [
    'src/routes/**/*.js',
    'src/controllers/**/*.js',
    // Add more paths if needed
  ],
};

const swaggerSpecs = swaggerJsDoc(options);

module.exports = swaggerSpecs;
