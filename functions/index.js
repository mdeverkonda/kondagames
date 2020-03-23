const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate')
const firebase = require('firebase-admin')

var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
//var urlencodedParser = bodyParser.urlencoded({ extended: false })



const app = express();
//app.engine('hbs', engines.handlebars)
//app.set('views', './views')
//app.set('view engine', 'hbs')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ type: 'application/*+json' }))

var serviceAccount = require("./kondagamesServiceAccountKey.json");

const firebaseApp = firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://kondagames.firebaseio.com/"
})

//var words = []

async function getData() {
    const db = firebaseApp.database().ref('/')

    try {
        return await db.once('value').then(snap => snap.val())
    } catch (exception) {
        console.warn(exception)
        return null
    }
}

async function getDataMap() {
    const words = await getData()
    //response.render('index', { words })

    const mp = new Map()

    for (let i = 0; i < words.length; i++) {
        obj = words[i]
        Object.keys(obj).forEach(key => {
            mp.set(key, obj[key]);
        });
    }

    return mp
}

async function getCandB(word) {

    try {

        console.log(word);

        var cows = 2
        var bulls = 1

        let result = "2C, 1B"

        //return result
        return word
    } catch (exception) {
        console.warn(exception)
        return null
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

async function getRandomWord() {

    try {

        randomNum = getRandomInt(29)
        const wordMap = await getDataMap()
        const key = "word-".concat(randomNum)
        return wordMap.get(key)
        
    } catch (exception) {
        console.warn(exception)
        return null
    }
}




// REST Methods 

app.get('/cnb/random_word', async (request, response) => {
    try {
        console.log("Pick Random Word")

        const wordResult = await getRandomWord()

        response.json({ "game-word": wordResult })
        return null
    }
    catch (exception) {
        console.warn(exception)
        return response.json(exception);
    }


});



app.post('/cnb/word/', async (request, response) => {
    try {
        var word = request.body.word
        console.log("Req Param - word: ", word)
        const wordResult = await getCandB(word)
        response.json({ "result": wordResult })
        return null
    }
    catch (exception) {
        console.warn(exception)
        return response.json(exception);
    }


});


app.get('/cnb/allwords/', async (request, response) => {
    try {
        //response.set('Cache-Control', 'public, max-age=300, s-maxage=600')

        const words = await getData()
    
        response.json(words)
        return null
    }
    catch (exception) {
        console.warn(exception)
        return response.render(exception);
    }
});


exports.app = functions.https.onRequest(app);