const express = require("express")

const midd= require ("../Middlewares/AuthMiddleware")

const {getBookedEvents, deleteBookedEvent} = require("../controllers/AreaPersonaleController")

const router = express.Router()

router.get("/booked_events", getBookedEvents)

router.delete("/cancel", deleteBookedEvent)

module.exports = router