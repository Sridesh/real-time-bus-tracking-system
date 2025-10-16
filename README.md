Student ID : COBSCCOMP241P-001

# Real-Time Bus Tracking System API

A RESTful API for the National Transport Commission of Sri Lanka to track and manage inter-provincial buses in real-time. This system provides GPS location tracking, route management, operator administration, and geospatial queries for efficient public transport operations.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Features

- **Bus Tracking:** Real-time GPS tracking of buses.
- **Route Management:** CRUD operations for bus routes, including stops and schedules.
- **Operator Management:** Manage bus operators, assign buses, and monitor activity.
- **Geospatial Queries:** Find nearby buses and stops using location data.
- **Authentication & Authorization:** JWT-based authentication and role-based access control (RBAC).
- **Rate Limiting:** Protects API endpoints from abuse.
- **Swagger API Docs:** Interactive API documentation.
- **Health Checks:** Monitor MongoDB and Redis connectivity.
- **Error Handling:** Standardized error responses.

---

## Architecture

- **Node.js & Express:** Backend REST API.
- **MongoDB:** Primary database for storing buses, routes, operators, stops, and location data.
- **Redis:** Used for caching, token management, and fast lookups.
- **Swagger:** API documentation and testing.
- **Winston:** Logging.

---

## Technology Stack

- Node.js (v16+)
- Express.js
- MongoDB (Atlas or local)
- Redis
- Mongoose (ODM)
- JWT (jsonwebtoken)
- Swagger (swagger-jsdoc, swagger-ui-express)
- Winston (logging)
- Jest (testing)

---

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB instance (local or Atlas)
- Redis server (local or cloud)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/real-time-bus-tracking-system.git
   cd real-time-bus-tracking-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your values.

4. **Start the server:**
   ```bash
   npm start
   ```
   The API will run on `http://localhost:3000`.

---

## Environment Variables

Create a `.env` file in the root directory with the following keys:

```env
PORT=3000
MONGO_CONNECTION_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/bus-tracking
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=30d
API_URL=http://localhost:3000/api
NODE_ENV=development
LOG_LEVEL=info
```

---

## API Documentation

Interactive API docs are available at:

```
http://localhost:3000/docs
```

The API follows RESTful conventions and uses JWT authentication for protected endpoints.

### Main Endpoints

- **Authentication:** `/api/v1/auth`
  - `POST /signup` - Register a new user
  - `POST /login` - Login and receive JWT tokens
  - `POST /refresh` - Refresh JWT tokens
  - `POST /logout` - Logout and invalidate refresh token

- **Bus Management:** `/api/v1/buses`
  - `GET /` - List all buses (with filters, pagination)
  - `GET /:busId` - Get bus details
  - `POST /` - Create a new bus (Admin only)
  - `PUT /:busId` - Update bus (Admin/Operator)
  - `DELETE /:busId` - Delete bus (Admin only)

- **Route Management:** `/api/v1/routes`
  - `GET /` - List all routes (filters, pagination)
  - `GET /:id` - Get route details
  - `POST /` - Create route (Admin only)
  - `PUT /:id` - Update route (Admin only)
  - `DELETE /:id` - Delete route (Admin only)
  - `GET /:id/buses` - Get buses on a route
  - `GET /:id/stops` - Get stops on a route
  - `GET /stops` - Find routes by stops

- **Stop Management:** `/api/v1/stops`
  - `GET /` - List all stops
  - `GET /:stopId` - Get stop details
  - `POST /` - Create stop (Admin only)
  - `PUT /:stopId` - Update stop (Admin only)
  - `DELETE /:stopId` - Delete stop (Admin only)
  - `GET /nearby` - Find nearby stops

- **Operator Management:** `/api/v1/operators`
  - `GET /` - List all operators (Admin only)
  - `GET /province` - Find operators by province
  - `GET /:id` - Get operator details
  - `POST /` - Create operator (Admin/Operator)
  - `PUT /:id` - Update operator (Admin/Operator)
  - `DELETE /:id` - Delete operator (Admin/Operator)
  - `GET /user/:userId` - Get operator by user ID

- **Location Tracking:** `/api/v1/location`
  - `POST /` - Update bus location (Operator only)
  - `GET /buses-active` - Get all active bus locations
  - `GET /estimated-arrival` - Get estimated arrival time for a bus
  - `POST /multiple-arrivals` - Get estimated arrival times for multiple buses
  - `GET /:busId` - Get current location of a bus
  - `POST /buses-nearby` - Find nearby buses

- **Health Check:** `/api/v1/health`
  - `GET /` - Returns MongoDB and Redis status

---

## Deployment

### Production Deployment

- **Server:** Ubuntu 22.04, Node.js 18+, MongoDB Atlas, Redis (cloud or local)
- **API URL:** `http://51.20.96.198/api`
- **Swagger Docs:** `http://51.20.96.198/docs`

#### Steps

1. Set up environment variables on the server.
2. Install Node.js, MongoDB, and Redis.
3. Clone the repository and install dependencies.
4. Use a process manager (e.g., PM2) for production.
5. Configure Nginx or Apache as a reverse proxy (optional).
6. Monitor logs via Winston.

---

## Testing

Unit and integration tests are written using Jest.

```bash
npm test
```

Test coverage includes:

- Bus service logic
- Route service logic
- Stop service logic
- Operator service logic
- Location service logic
- Redis service

---

## Project Structure

```
src/
  app.js                # Express app setup
  config/               # Config files (DB, logger, swagger)
  controllers/          # Route handlers
  middleware/           # Auth, error, rate limiting
  models/               # Mongoose schemas
  repositories/         # Data access logic
  routes/               # Express routes
  services/             # Business logic
  utils/                # Utility functions
tests/                  # Jest test suites
server.js               # Entry point
.env.example            # Environment variable template
README.md               # Documentation
```

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## Contact

- **API Support:** [support@ntc.gov.lk](mailto:support@ntc.gov.lk)
- **Maintainer:** [Your Name](mailto:your.email@example.com)

---

## References

- [Swagger OpenAPI Specification](https://swagger.io/specification/)
- [MongoDB GeoJSON](https://docs.mongodb.com/manual/geospatial-queries/)
- [JWT Authentication](https://jwt.io/)
- [Node.js Express](https://expressjs.com/)

---

## Acknowledgements

Special thanks to the National Transport Commission of Sri Lanka and all contributors.
