const Eventi = require("../models/modelEventi")
const Personal = require("../models/modelAreaPersonale")
const nodemailer = require('nodemailer');
const mongoose = require('mongoose')

const getAllEventi = async (req, res) => {
        try {
            const eventi = await Eventi.find({}, {comments: 0})
            res.status(200).json({msg: "ok", eventi: eventi})
        } catch (err) {
            res.status(500).json({msg: "error", err: err})
        }
}

const bookedEvent = async (req, res) => {

  const  eventId  = req.body.eventId;
  const  userId  = req.body.user_id;
  const tickets = req.body.tickets;
  const eventObjectId = new mongoose.Types.ObjectId(eventId)

  try {
    const event = await Eventi.findOne({ 'cardContent._id': eventId });
    
    if (!event) return res.status(404).json({msg: 'Evento non trovato' })
    
    const eventContent = event.cardContent.id(eventId);
    if (eventContent.biglietti<tickets) res.status(500).json({msg: 'Selezionare un numero di biglietti accettabile'})

    await Eventi.updateOne({ 'cardContent._id': eventId }, {$inc: {biglietti: -tickets}})
    eventContent.booked_users.push(userId);
    await event.save();

    const user = await Personal.findOne({'_id': userId});
    const bookedEvent = user.booked_events.find(be => be.event.toString() === eventId);
    if(bookedEvent){await Personal.updateOne({'_id': userId, 'booked_events.event': eventObjectId}, {$inc: {'booked_events.$.tickets': tickets}})}
    else await Personal.updateOne({'_id': userId}, {$push: {'booked_events': {event: eventId, tickets: tickets}}})
    
    res.json({msg: 'Evento prenotato'});
  } catch (err) {
    res.status(500).json({msg: "error", msg: err.message });
  }
}

const transporter = nodemailer.createTransport({
  //host: "smtp.google.com",
  //port: 587,
  //secure: false, // STARTTLS
  service: "gmail",
  auth : {
    user: "politicket2024@gmail.com",
    pass: "ckvohxwjghskdapz"
  }
})

const eventInfoEmail = async (req, res) => {

  try {
    const  eventId  = req.body.eventId;
    const  userId  = req.body.user_id;

    console.log("eventId ", eventId)
    console.log("userId", userId)

    const event = await Eventi.findOne({ 'cardContent._id': eventId });

    const user = await Personal.findById(userId);

    if (!event || !user) {
      return res.status(404).json({ msg: 'Evento o utente non trovato' });
    }

    const eventContent = event.cardContent.id(eventId);
    const mailContent = {
      from: "politicketservice@gmail.com", 
      to: user.email, 
      subject: `Informazioni sull'evento: ${eventContent.title}`,
      html: `
        <p>Ciao ${user.email},</p>
        <p>ecco le informazioni sull'evento di tuo interesse <strong>"${eventContent.title}"</strong>:</p>
        <ul>
          <li><strong>Data:</strong> ${eventContent.date}</li>
          <li><strong>Luogo:</strong> ${eventContent.location}</li>
          <li><strong>Info:</strong> ${eventContent.info}</li>
        </ul>
        <p><img src="${eventContent.artwork}" alt="artwork evento" style="max-width: 600px; height: auto;"></p>
        `
    };

    transporter.sendMail(mailContent, (error, info) => {
      if (error) {
        return res.status(500).json({ msg: 'Errore durante l\'invio dell\'email', error });
      }
      return res.status(200).json({ msg: 'Email inviata con successo' });
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getAllComments = async (req, res) => {
  const eventId = req.query.eventId;

  const sendComments = async () => {
    try {
      const event = await Eventi.findOne({'cardContent._id': eventId});
      const eventContent = event.cardContent.id(eventId);
      const data = JSON.stringify(eventContent.comments);
      res.sse.data({ data: data });
    } catch (err) {
      console.error('Errore durante il recupero dei commenti:', err);
      if (!res.headersSent) res.status(500).json({ msg: "Error", err: err });
    }
  };

  try {
    await sendComments();

    const intervalId = setInterval(async () => {
      await sendComments();
    }, 10000);

    req.on('close', () => {
      clearInterval(intervalId);
    });

  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ msg: "Error", err: err });
    }
  }
};


const addComment = async (req, res) => {
  const eventId = req.body.eventId;
  const userId = req.body.user_id;
  const text = req.body.text;

  try {
    const user = await Personal.findOne({ '_id': userId });
    if(!user) return res.status(404).send({msg: 'Utente non trovato'})

   
    const username = user.email;
    console.log(username);

    const event = await Eventi.findOne({'cardContent._id': eventId})
    if(!event) return res.status(404).send({msg: 'Evento non trovato'})

    const eventContent = event.cardContent.id(eventId);

    eventContent.comments.push({username: username, text: text})
    await event.save()

    res.status(200).send({msg: 'Commento pubblicato con successo'});
  } catch (err) {
    console.log(err)
    res.status(500).send({msg: 'Errore durante l\'aggiunta del commento:', err: err});
  }
};


module.exports = {getAllEventi, bookedEvent, eventInfoEmail, addComment, getAllComments}