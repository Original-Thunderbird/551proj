const express = require('express')
const firebase = require('firebase/app')
const fbAuth = require('firebase/auth')
const fStore = require('firebase/firestore')

const mySQLApp = require('mysql')
const cors = require("cors")
const { getAuth } = require('firebase/auth')
const { getFirestore } = require('firebase/firestore')

const app = express()
app.use(cors())
app.use(express.json())

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
    apiKey: "AIzaSyDslr5vIL3zU9aUf2sYopP-lsmzkAcJrBo",
    authDomain: "dsci551-85451.firebaseapp.com",
    databaseURL: "https://dsci551-85451-default-rtdb.firebaseio.com",
    projectId: "dsci551-85451",
    storageBucket: "dsci551-85451.appspot.com",
    messagingSenderId: "413318604891",
    appId: "1:413318604891:web:fab9aeb0b27f7e020cb77e",
    measurementId: "G-6P3LJQ53SD"
};

// Initialize Firebase
fbApp = firebase.initializeApp(firebaseConfig);
const auth = getAuth(fbApp)
const fbDB = getFirestore


const sqlDB = mySQLApp.createConnection({
    user: 'admin',
    host: 'localhost',
    password: '123456',
    database: 'playground'
})

handle = 1

app.post('/create', (req, res) => {
    console.log("body: ", req.body)
    const name = req.body.name
    const age = req.body.age
    const country = req.body.country

    switch(handle){
        case 1:
            sqlDB.query(
                'INSERT INTO employees (name, age, country) VALUES (?, ?, ?)', 
                [name, age, country], (err, result) => {
                    if(err) {
                        console.log(err)
                    } else {
                        res.send("Vals inserted")
                    }
                }
            );
            break;
        case 2:
            emp.add(req.body)
            res.send("Vals inserted")
    }
});

app.get('/employees', (req, res) => {
    sqlDB.query("SELECT * FROM employees", (err, result) => {
        if(err) {
            console.log(err)
        } else {
            res.send(result)
        }
    });
})

app.listen(3001, () => {
    console.log("hello node")
})