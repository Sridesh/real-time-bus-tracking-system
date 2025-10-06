const express = require("express");
const busesRoutes = require("./v1/buses.routes");

const router = express.Router();

router.use("/v1/buses", busesRoutes);

module.exports = router;
