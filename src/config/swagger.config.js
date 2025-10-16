const swaggerJsDoc = require('swagger-jsdoc');

// Determine the server URL based on environment
const getServerUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.API_URL || 'http://51.20.96.198/api';
  }
  return `http://localhost:${process.env.PORT || 3000}/api`;
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Time Bus Tracking System - API',
      version: '1.0.0',
      description:
        'A RESTful API service for the National Transport Commission of Sri Lanka to track and manage inter-provincial buses in real-time. Features include GPS location tracking, route management, operator administration, and geospatial queries.',
      contact: {
        name: 'API Support',
        email: 'support@ntc.gov.lk',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      // {
      //   url: getServerUrl(),
      //   description:
      //     process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server',
      // },
      {
        url: 'http://localhost:3000/api',
        description: 'Local Development',
      },
      {
        url: 'http://51.20.96.198',
        description: 'Production',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in format: Bearer <token>',
        },
      },
      schemas: {
        // Success Response Schema
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
            metadata: {
              type: 'object',
              properties: {
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                },
                requestId: {
                  type: 'string',
                  format: 'uuid',
                },
              },
            },
          },
        },

        // Error Response Schema
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR',
                },
                message: {
                  type: 'string',
                  example: 'Invalid input parameters',
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
            metadata: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time' },
                requestId: { type: 'string', format: 'uuid' },
              },
            },
          },
        },

        // Pagination Schema
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 150 },
            totalPages: { type: 'integer', example: 8 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false },
          },
        },

        // User Schema
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
            email: { type: 'string', example: 'operator@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: {
              type: 'string',
              enum: ['admin', 'operator', 'commuter'],
              example: 'operator',
            },
            operatorId: { type: 'string', example: '60d21b4667d0d8992e610c86' },
            isActive: { type: 'boolean', example: true },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // Operator Schema
        Operator: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
            name: { type: 'string', example: 'Ceylon Transport Company' },
            licenseNumber: { type: 'string', example: 'LIC-2024-001' },
            contactPerson: { type: 'string', example: 'Mr. Perera' },
            email: { type: 'string', example: 'contact@ctc.lk' },
            phone: { type: 'string', example: '+94112345678' },
            address: { type: 'string', example: '123 Main St, Colombo' },
            province: { type: 'string', example: 'Western' },
            status: {
              type: 'string',
              enum: ['active', 'suspended', 'inactive'],
              example: 'active',
            },
            totalBuses: { type: 'integer', example: 5 },
            activeBuses: { type: 'integer', example: 3 },
            registrationDate: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // Bus Schema
        Bus: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
            registrationNumber: { type: 'string', example: 'WP-CAB-1234' },
            operatorId: { type: 'string', example: '60d21b4667d0d8992e610c86' },
            routeId: { type: 'string', example: '60d21b4667d0d8992e610c87' },
            capacity: { type: 'integer', example: 52 },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'maintenance', 'out_of_service'],
              example: 'active',
            },
            model: { type: 'string', example: 'Ashok Leyland Viking' },
            manufacturer: { type: 'string', example: 'Ashok Leyland' },
            yearManufactured: { type: 'integer', example: 2020 },
            features: {
              type: 'array',
              items: { type: 'string' },
              example: ['AC', 'WiFi', 'USB Charging'],
            },
            fuelType: { type: 'string', example: 'Diesel' },
            isTracking: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // Route Schema
        Route: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
            name: { type: 'string', example: 'Colombo - Kandy Express' },
            routeNumber: { type: 'string', example: '01-001' },
            origin: { type: 'string', example: 'Colombo' },
            destination: { type: 'string', example: 'Kandy' },
            distance: { type: 'number', example: 115.5 },
            estimatedDuration: { type: 'integer', example: 180 },
            fare: { type: 'number', example: 350.0 },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
              example: 'active',
            },
            operatingDays: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
              ],
            },
            stops: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Colombo Fort' },
                  sequence: { type: 'integer', example: 1 },
                  latitude: { type: 'number', example: 6.9271 },
                  longitude: { type: 'number', example: 79.8612 },
                  estimatedArrival: { type: 'integer', example: 0 },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // Location Schema
        Location: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
            busId: { type: 'string', example: '60d21b4667d0d8992e610c86' },
            latitude: { type: 'number', example: 6.9271 },
            longitude: { type: 'number', example: 79.8612 },
            speed: { type: 'number', example: 65.5 },
            heading: { type: 'number', example: 180 },
            accuracy: { type: 'number', example: 5.0 },
            timestamp: { type: 'string', format: 'date-time' },
            isMoving: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/**/*.js', './src/controllers/**/*.js', './src/models/**/*.js'],
};

const swaggerSpecs = swaggerJsDoc(options);

module.exports = swaggerSpecs;
