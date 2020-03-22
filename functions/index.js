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
    }catch(exception) {
        console.warn(exception)
        return null
    }
}

async function getCandB(word) {
    
    try {
        
        console.log(word);
        
        var cows = 2
        var bulls = 1

        let result = "2C, 1B"

        return result
    }catch(exception) {
        console.warn(exception)
        return null
    }
}

app.post('/cnb/word/', async (request, response) => {
    var word = request.body.word
    
    console.log("Req Param - word: ", word)

    const wordResult = await getCandB(word)

    response.json({"result": wordResult})
    return null

});


app.get('/cnb/allwords/', async (request, response) => {
    try {
        response.set('Cache-Control', 'public, max-age=300, s-maxage=600')
        const words = await getData()
        //console.log(words)
        //response.render('index', { words })
        response.json(words)
        return null
    } catch(exception){
        console.warn(exception)
        return response.render(exception);
    }
});


exports.app = functions.https.onRequest(app);



// app.get('/cnb/word', async (request, response) => {
//     try {
//         response.set('Cache-Control', 'public, max-age=300, s-maxage=600')
//         let reqWord = request.param("word")

//         console.log("Req Param - word: ", reqWord)

//         const wordResult = await getCandB(reqWord)
//         //console.log(words)
//         //response.render('word-result', { wordResult })
//         response.json({"result": wordResult})
//         return null
//     } catch(exception){
//         console.warn(exception)
//         return response.render(exception);
//     }
// });


