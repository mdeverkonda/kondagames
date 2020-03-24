const functions = require('firebase-functions');
const express = require('express');
var session = require("express-session")
const engines = require('consolidate')
const firebase = require('firebase-admin')

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
//var urlencodedParser = bodyParser.urlencoded({ extended: false })


global.gameWord = ""
global.gameInProgress = false

const app = express();
//app.engine('hbs', engines.handlebars)
//app.set('views', './views')
//app.set('view engine', 'hbs')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ type: 'application/*+json' }))

app.use(session({resave: true, saveUninitialized: true, secret: 'cnb', cookie: { maxAge: 120000 }}));


var serviceAccount = require("./kondagamesServiceAccountKey.json");

const firebaseApp = firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://kondagames.firebaseio.com/"
})


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
        const word = wordMap.get(key)
        console.log("Random Word is: ", word)
        return word

    } catch (exception) {
        console.warn(exception)
        return null
    }
}

async function getGameWord() {
    try {

        console.log("calling game word")

        if (gameInProgress == false ) {
            gameWord = await getRandomWord()
            console.log("Game Word is : ", gameWord)
            gameInProgress = true
            session.gameInProgress = gameInProgress
            session.gameWord = gameWord
            return gameWord
        }
        else {
            console.log("Game Word is : ", gameWord)
            return "Game in Progress"
        }

    }
    catch (exception) {
        console.warn(exception)
        return null
    }
}


// REST Methods 

app.get('/cnb/game_word', async (request, response) => {
    try {
        
        session = request.session
        try {
            gameInProgress = Boolean(session.gameInProgress)
            console.log(gameInProgress)
        }
        catch (exception) {
            console.warn(exception)
            gameInProgress = false
        }

        const wordResult = await getGameWord()

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
        session = request.session
        gameInProgress = session.gameInProgress
        
        if (gameInProgress == true){
            gameWord = session.gameWord
            console.log("Req Param - word: ", word)
            //const wordResult = await getCandB(word)
            console.log("Game Word is: ", gameWord)

            cowCount = 0
            bullCount = 0

            for (var i = 0; i < word.length; i++) {
                wordChar = word.charAt(i)
                for(var k=0; k < gameWord.length;k++ ) {
                    gameChar = gameWord.charAt(k)
                    if(wordChar == gameChar) {
                        if (k == i) {
                            bullCount++
                        }
                        else {
                            cowCount++
                        }
                    }
                }
            }

            console.log("bullCount: ", bullCount)
            console.log("cowCount: ", cowCount)

            if (bullCount < 4) {
                result = bullCount + " Bs and " + cowCount + " Cs"
                response.json({ "result": result })
            }
            else {
                result = "You got it. Its the game"
                session.gameWord = ""
                session.gameInProgress = false
                response.json({ "result": result })
            }
        }
        else {
            response.json("Game Not Started")
        }
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