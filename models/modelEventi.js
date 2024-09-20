const mongoose = require("mongoose")

const modelEventiSchema = new mongoose.Schema({
  
  eventType: {
    type: String
  },
  cardContent: {
    type: [{
        id: {type: Number},
        title: {type: String},
        date: {type: String},
        location: {type: String},
        info: {type: String},
        artwork:{type: String},
        booked_users:[ {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        } ],
        comments: [{
          username: String,
          text: String
        } ],
        biglietti:{type: Number}

    }]
  },
})


module.exports = mongoose.model("Eventi", modelEventiSchema)