const express = require('express')
const { sse } = require("@toverux/expresse")

const {sendNews} = require('../controllers/newsController.js')

const router = express.Router()

router.get("/", sse(), sendNews)

module.exports = router