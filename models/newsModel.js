const mongoose = require("mongoose")

const newsSchema = new mongoose.Schema({

    type: {
        type: String
    },

    title: {
        type: String
    },
    date: {
        type: String
    },
    location: {
        type: String
    },
    
    artwork:{
        type: String
    },
})

module.exports = mongoose.model("News", newsSchema)
