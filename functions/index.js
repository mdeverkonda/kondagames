const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate')
const firebase = require('firebase-admin')

const app = express();
app.engine('hbs', engines.handlebars)
app.set('views', './views')
app.set('view engine', 'hbs')

var serviceAccount = require("./kondagamesServiceAccountKey.json");

const firebaseApp = firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://kondagames.firebaseio.com/"
})

//var words = []

async function getData() {
    const db = firebaseApp.database().ref('/')
    
    try {
        // db.once('value').then(console.log).catch(console.warn)

        // db.once('value').then(snap => {
        //     console.log(snap.val())
        //     words.push(snap.val())
        // })
        
        // return words

        return await db.once('value').then(snap => snap.val())
    }catch(exception) {
        console.warn(exception)
        return null
    }
}


app.get('/', async (request, response) => {
    try {
        response.set('Cache-Control', 'public, max-age=300, s-maxage=600')
        const words = await getData()
        //console.log(words)
        response.render('index', { words })
        return null
    } catch(exception){
        console.warn(exception)
        return response.render(exception);
    }
});

exports.app = functions.https.onRequest(app);
