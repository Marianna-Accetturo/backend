const Personal = require("../models/modelAreaPersonale")
const Eventi = require("../models/modelEventi") 
const mongoose = require("mongoose")

const getBookedEvents = async (req, res) => {
      const userId = req.query.user_id;
      console.log(userId)
      if(!userId) return res.status(500).json({msg: 'Id Utente non valido'})
      const userObjectId = new mongoose.Types.ObjectId(userId)

      
  try {
    const eventi = await Eventi.find({})
    const eventiPrenotati = eventi.map(event => ({...event.toObject(),
      cardContent: event.cardContent.filter(content => content.booked_users.includes(userId))
    })).filter(event => event.cardContent.length > 0);

    if (eventiPrenotati.length === 0) {
        return res.status(404).json({ message: 'Non hai prenotato nessun evento' });
    }
      res.status(200).json({msg: "ok", eventi: eventiPrenotati})
  } catch (err) {
      res.status(500).json({msg: "error", err: err})
  }
}

const deleteBookedEvent = async (req, res) => {
  const  eventId  = req.body.eventId;
  const  userId  = req.body.user_id;
  const tickets = parseInt(req.body.tickets);
  if(!userId) return res.status(500).json({msg: 'Id Utente non valido'})
    if(!eventId) return res.status(500).json({msg: 'Id Evento non valido'})
  const eventObjectId = new mongoose.Types.ObjectId(eventId)
const userObjectId = new mongoose.Types.ObjectId(userId)

  

    try {
    const event = await Eventi.findOne({ 'cardContent._id': eventId });

    if (!event) return res.status(404).json({msg: 'Evento non trovato' });

    const eventContent = event.cardContent.id(eventId); 
    
    if (!eventContent.booked_users.includes(userId)) {
      return res.status(400).json({msg: 'Prenotazione non trovata' });
    }

    Eventi.updateOne({ 'cardContent._id': eventId }, {$inc: {biglietti: tickets}})
    await event.save();

    const user = await Personal.findById(userId);
    const bookedEvent = user.booked_events.find(be => be.event.toString() === eventId);
    const ownedTickets = bookedEvent.tickets;
    console.log("i tuoi biglietti sono ", ownedTickets); console.log("stai cercando di eliminarne ",tickets);
    if(tickets>ownedTickets) return res.status(500).json({msg: 'Il numero di cancellazioni non è accettabile'})
      else if(tickets === ownedTickets) {console.log("ciao"); await Personal.updateOne({'_id': userId}, { $pull: { 'booked_events': { event: eventObjectId }}}); await Eventi.updateOne({'cardContent._id':eventId}, {$pull : {'cardContent.$.booked_users': userObjectId}}); }
        else await Personal.updateOne({'_id': userId, 'booked_events.event': eventId}, {$inc : {'booked_events.$.tickets': -tickets}})

    res.status(200).json({msg: 'Prenotazione cancellata '});
  } catch (err) {
    res.status(500).json({msg: "errore", msg: err.message });
  }
}


module.exports = {getBookedEvents, deleteBookedEvent}