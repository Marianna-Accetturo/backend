const express = require("express")
const { sse } = require("@toverux/expresse")

const midd= require ("../Middlewares/AuthMiddleware")

const {getAllEventi, bookedEvent, addComment, getAllComments, eventInfoEmail} = require("../controllers/EventiController")

const router = express.Router()

router.get("/", getAllEventi)

router.post("/book", bookedEvent)

router.get("/getComments", sse(), getAllComments)

router.post("/addComment", addComment)

router.post("/sendemail", eventInfoEmail)

module.exports = router;