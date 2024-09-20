const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const Eventi = require('../models/modelEventi.js');
const News= require ('../models/newsModel.js')
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('static'));

mongoose.connect("mongodb+srv://web:web@sito.v46sfqa.mongodb.net/?retryWrites=true&w=majority&appName=sito")
.then(() => {
    console.log('Connessione al DB effettuata');

const eventiFilePath = path.join(__dirname, './db/eventi.json');
const newsFilePath = path.join(__dirname, './db/news.json');

async function inserisciDatiDaFile(file, Modello) {
    try {
        const data = await fs.readFile(file, 'utf8');
        const jsonData = JSON.parse(data);

        if (!Array.isArray(jsonData)) {
            throw new TypeError(`Il contenuto di ${file} non è un array`);
        }

        jsonData.forEach(doc => {
            const newDoc = new Modello(doc);
            const error = newDoc.validateSync();
            if (error) {
                console.warn(`Documento non valido trovato in ${file}:`, error.errors);
                throw error;
            }
        });

        await Modello.insertMany(jsonData);
        console.log(`Inseriti ${jsonData.length} documenti da ${file} in MongoDB`);
    } catch (err) {
        console.error(`Errore durante l'inserimento dei dati da ${file}:`, err);
    }
}

async function caricaDati() {
    try {
        await fs.access(eventiFilePath);
        await inserisciDatiDaFile(eventiFilePath, Eventi);
    } catch (err) {
        console.error(`Errore nell'accesso al file eventi.json:`, err);
    }

    try {
        await fs.access(newsFilePath);
        await inserisciDatiDaFile(newsFilePath, News);
    } catch (err) {
        console.error(`Errore nell'accesso al file news.json:`, err);
    }
}

caricaDati();

}).catch(err => console.error('Errore durante la connessione al DB:', err));

app.listen(3000, () => {
    console.log(`Server is running on http://localhost:${3000}`);
});
